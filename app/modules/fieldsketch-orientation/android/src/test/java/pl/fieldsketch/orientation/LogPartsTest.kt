package pl.fieldsketch.orientation

import java.io.File
import java.io.RandomAccessFile
import org.junit.Assert.*
import org.junit.Test

class LogPartsTest {
  @Test fun partsPreserveUtf8RecordsAndByteLimit() {
    val text = (1..4000).joinToString("") { "{\"sequence\":$it,\"notes\":\"Zażółć gęślą jaźń 🚶\"}\n" }
    val file = File.createTempFile("fieldsketch-test-", ".jsonl")
    try {
      file.writeText(text, Charsets.UTF_8)
      val parts = LogParts.index(file, 1024)
      assertTrue(parts.size > 1)
      val rebuilt = StringBuilder()
      RandomAccessFile(file, "r").use { f ->
        for ((offset, size) in parts) {
          assertTrue(size <= 1024)
          val data = ByteArray(size); f.seek(offset); f.readFully(data)
          val part = String(data, Charsets.UTF_8)
          assertTrue(part.endsWith("\n")); assertTrue(part.startsWith("{\"sequence\":")); rebuilt.append(part)
        }
      }
      assertEquals(text, rebuilt.toString())
    } finally { file.delete() }
  }
  @Test fun incompleteTailAndOversizedRecordAreNotSilentlyLost() {
    val file = File.createTempFile("fieldsketch-test-", ".jsonl")
    try {
      file.writeText("{}\n{broken")
      try { LogParts.index(file); fail("Expected partial record error") } catch (_: IllegalStateException) { }
      assertEquals("{}\n{broken", file.readText())
      file.writeText("123456\n")
      try { LogParts.index(file, 4); fail("Expected size error") } catch (_: IllegalStateException) { }
      assertEquals("123456\n", file.readText())
    } finally { file.delete() }
  }
}
