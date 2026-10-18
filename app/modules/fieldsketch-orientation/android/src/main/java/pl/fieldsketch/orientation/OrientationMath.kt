package pl.fieldsketch.orientation

import kotlin.math.*

object OrientationMath {
  data class Direction(val heading: Double, val projection: Double, val pitch: Double)
  fun cameraDirection(matrix: FloatArray): Direction {
    require(matrix.size == 9)
    val east = -matrix[2].toDouble(); val north = -matrix[5].toDouble(); val up = -matrix[8].toDouble()
    val projection = hypot(east, north)
    return Direction(atan2(east, north), projection, atan2(up, projection))
  }
  fun circularStats(headings: List<Double>): Pair<Double, Double> {
    if (headings.isEmpty()) return 0.0 to 180.0
    val east = headings.map { sin(it) }.average(); val north = headings.map { cos(it) }.average()
    val r = hypot(east, north).coerceIn(1e-12, 1.0)
    return atan2(east, north) to Math.toDegrees(sqrt(-2 * ln(r)))
  }
  fun windowReady(size: Int, first: Long, last: Long) = size >= 30 && last - first >= 1_900_000_000
  fun stable(stdDevDeg: Double, accuracy: Int) = stdDevDeg <= 3 && accuracy >= 2
}
