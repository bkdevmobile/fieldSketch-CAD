package pl.fieldsketch.orientation

import android.content.Context
import android.os.SystemClock
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.UUID

fun utcNow(): String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.format(Date())

/** One synchronized writer shared by sensor callbacks and JS commands. Not a cache. */
class DiagnosticStore(context: Context) {
  private val dir = File(context.filesDir, "fieldsketch-logs").apply { mkdirs() }
  private val snapshots = File(context.cacheDir, "fieldsketch-log-snapshots").apply { mkdirs() }
  private var stream: FileOutputStream? = null
  private var buffer = StringBuilder()
  private var bufferedBytes = 0L
  private var sequence = 0L
  private var projectId = ""
  var sessionId: String? = null; private set
  private var used = 0L
  private val indexes = mutableMapOf<String, List<Pair<Long, Int>>>()
  private val limit = 100L * 1024 * 1024
  val warning get() = used + bufferedBytes >= 80L * 1024 * 1024

  init {
    snapshots.listFiles()?.forEach { it.delete() }
    dir.listFiles { f -> f.extension == "jsonl" }?.forEach { file ->
      // Recover a truncated last record without discarding complete records.
      RandomAccessFile(file, "rw").use { f ->
        var end = f.length()
        if (end > 0) {
          f.seek(end - 1)
          if (f.read() != 10) {
            while (end > 0) { f.seek(end - 1); if (f.read() == 10) break; end-- }
            f.setLength(end)
          }
        }
      }
      val meta = metaFile(file.nameWithoutExtension)
      if (meta.exists()) {
        val data = JSONObject(meta.readText())
        if (data.optString("status") == "running") {
          val lastSequence = file.useLines { lines -> lines.filter { it.isNotBlank() }.lastOrNull()?.let { JSONObject(it).optLong("sequence") } } ?: data.optLong("sequence")
          val record = JSONObject().put("logSchemaVersion", 1).put("sequence", lastSequence + 1)
            .put("sessionId", file.nameWithoutExtension).put("projectId", data.optString("projectId"))
            .put("timestampUtc", utcNow()).put("monotonicNs", SystemClock.elapsedRealtimeNanos().toString())
            .put("type", "session_interrupted").put("data", JSONObject().put("reason", "Process ended; unflushed samples may be missing"))
          file.appendText(record.toString() + "\n")
          data.put("status", "interrupted").put("sequence", lastSequence + 1); writeMeta(meta, data)
        }
      }
    }
    used = dir.listFiles()?.filter { it.extension == "jsonl" }?.sumOf { it.length() } ?: 0
  }
  private fun logFile(id: String): File {
    require(id.matches(Regex("[a-zA-Z0-9-]+"))) { "Invalid session id" }
    return File(dir, "$id.jsonl")
  }
  private fun metaFile(id: String) = File(dir, "$id.meta.json")
  private fun writeMeta(file: File, data: JSONObject) {
    val temp = File(file.parentFile, file.name + ".tmp")
    FileOutputStream(temp).use { it.write(data.toString().toByteArray(Charsets.UTF_8)); it.fd.sync() }
    check(temp.renameTo(file)) { "Nie udało się zapisać metadanych loga" }
  }
  @Synchronized fun start(project: String, header: JSONObject): String {
    stop("new_session")
    check(used < limit - 8192) { "Limit logów 100 MiB. Usuń wcześniejszą sesję." }
    projectId = project; sequence = 0; sessionId = UUID.randomUUID().toString()
    stream = FileOutputStream(logFile(sessionId!!), true)
    writeMeta(metaFile(sessionId!!), JSONObject().put("id", sessionId).put("projectId", project)
      .put("createdAt", utcNow()).put("status", "running").put("sequence", 0))
    append("session_start", header); flush(); return sessionId!!
  }
  @Synchronized fun append(type: String, data: JSONObject): Long {
    val sid = sessionId ?: error("Brak aktywnej sesji logów")
    val record = JSONObject().put("logSchemaVersion", 1).put("sequence", sequence + 1)
      .put("sessionId", sid).put("projectId", projectId).put("timestampUtc", utcNow())
      .put("monotonicNs", SystemClock.elapsedRealtimeNanos().toString()).put("type", type).put("data", data)
    val line = record.toString() + "\n"
    val size = line.toByteArray(Charsets.UTF_8).size
    check(size <= 120 * 1024) { "Rekord loga przekracza 120 KiB" }
    val ceiling = if (type in listOf("recording_error", "session_end")) limit else limit - 4096
    check(used + bufferedBytes + size <= ceiling) { "Limit logów 100 MiB. Rejestracja zatrzymana." }
    buffer.append(line); bufferedBytes += size; sequence++; return sequence
  }
  @Synchronized fun flush() {
    val output = stream ?: return
    if (buffer.isNotEmpty()) {
      output.write(buffer.toString().toByteArray(Charsets.UTF_8)); output.flush(); output.fd.sync()
      used += bufferedBytes; buffer = StringBuilder(); bufferedBytes = 0
      sessionId?.let { sid ->
        val file = metaFile(sid)
        if (file.exists()) writeMeta(file, JSONObject(file.readText()).put("sequence", sequence))
      }
    }
  }
  @Synchronized fun stop(reason: String) {
    val sid = sessionId ?: return
    var failure: Exception? = null
    try { append("session_end", JSONObject().put("reason", reason)) } catch (e: Exception) { failure = e }
    try { flush() } finally { stream?.close(); stream = null; sessionId = null }
    val meta = metaFile(sid)
    writeMeta(meta, JSONObject(meta.readText()).put("status", if (failure == null) "complete" else "interrupted").put("sequence", sequence))
    if (failure != null) throw failure
  }
  @Synchronized fun list(): List<Map<String, Any>> {
    flush()
    return dir.listFiles { f -> f.name.endsWith(".meta.json") }?.map { file ->
      val obj = JSONObject(file.readText()); val sid = obj.getString("id")
      mapOf("id" to sid, "projectId" to obj.optString("projectId"), "createdAt" to obj.optString("createdAt"),
        "status" to obj.optString("status"), "bytes" to logFile(sid).length().toDouble())
    }?.sortedByDescending { it["createdAt"].toString() } ?: emptyList()
  }
  @Synchronized fun delete(id: String) {
    check(id != sessionId) { "Najpierw zakończ aktywną sesję" }
    val file = logFile(id); val size = file.length()
    check(!file.exists() || file.delete()) { "Nie udało się usunąć loga" }
    metaFile(id).delete(); used -= size
    snapshots.listFiles()?.forEach { it.delete() }; indexes.clear()
  }
  @Synchronized fun snapshot(id: String): Map<String, Any> {
    flush()
    // Keep only the newest snapshot: the UI only opens one log at a time.
    snapshots.listFiles()?.forEach { it.delete() }; indexes.clear()
    val token = UUID.randomUUID().toString(); val target = File(snapshots, "$token.jsonl")
    logFile(id).copyTo(target, overwrite = true)
    val parts = LogParts.index(target)
    indexes[token] = parts
    return mapOf("token" to token, "sessionId" to id, "parts" to parts.size, "uri" to target.toURI().toString(), "bytes" to target.length().toDouble())
  }
  @Synchronized fun part(token: String, index: Int): String {
    val (offset, size) = indexes[token]?.getOrNull(index) ?: error("Migawka wygasła. Otwórz log ponownie.")
    return RandomAccessFile(File(snapshots, "$token.jsonl"), "r").use { f ->
      f.seek(offset); val bytes = ByteArray(size); f.readFully(bytes); String(bytes, Charsets.UTF_8)
    }
  }
}
