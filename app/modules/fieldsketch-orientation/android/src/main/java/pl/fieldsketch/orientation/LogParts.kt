package pl.fieldsketch.orientation

import java.io.File

object LogParts {
  /** Byte offsets, with UTF-8 records kept whole. Buffered reads avoid one syscall per byte. */
  fun index(file: File, maxBytes: Int = 128 * 1024): List<Pair<Long, Int>> {
    val parts = mutableListOf<Pair<Long, Int>>()
    var cursor = 0L; var lineStart = 0L; var partStart = 0L; var partBytes = 0
    file.inputStream().buffered().use { input ->
      val buffer = ByteArray(64 * 1024)
      while (true) {
        val count = input.read(buffer); if (count < 0) break
        for (i in 0 until count) {
          cursor++
          if (buffer[i] == 10.toByte()) {
            val size = cursor - lineStart
            check(size <= maxBytes) { "Rekord loga przekracza limit kopiowania" }
            if (partBytes > 0 && partBytes + size > maxBytes) {
              parts.add(partStart to partBytes); partStart = lineStart; partBytes = 0
            }
            partBytes += size.toInt(); lineStart = cursor
          }
        }
      }
    }
    check(lineStart == cursor) { "Log zawiera niedokończony rekord" }
    if (partBytes > 0) parts.add(partStart to partBytes)
    if (parts.isEmpty()) parts.add(0L to 0)
    return parts
  }
}
