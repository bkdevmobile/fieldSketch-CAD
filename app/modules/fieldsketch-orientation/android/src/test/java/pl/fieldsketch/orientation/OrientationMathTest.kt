package pl.fieldsketch.orientation

import org.junit.Assert.*
import org.junit.Test

class OrientationMathTest {
  @Test fun rearCameraDirectionUsesMinusZNotPhoneTop() {
    // Phone held upright, rear camera pointing North.
    val north = OrientationMath.cameraDirection(floatArrayOf(1f,0f,0f, 0f,0f,-1f, 0f,1f,0f))
    assertEquals(0.0, north.heading, 1e-9); assertEquals(1.0, north.projection, 1e-9)
    val east = OrientationMath.cameraDirection(floatArrayOf(0f,0f,-1f, -1f,0f,0f, 0f,1f,0f))
    assertEquals(Math.PI / 2, east.heading, 1e-9)
    val flat = OrientationMath.cameraDirection(floatArrayOf(1f,0f,0f, 0f,1f,0f, 0f,0f,1f))
    assertTrue(flat.projection < 0.2)
  }
  @Test fun circularMeanWrapsAtNorth() {
    val (mean, deviation) = OrientationMath.circularStats(listOf(Math.toRadians(359.0), Math.toRadians(1.0)))
    assertEquals(0.0, mean, 1e-9); assertEquals(1.0, deviation, 0.01)
  }
  @Test fun stabilizationRequiresHistoryAndQuality() {
    assertFalse(OrientationMath.windowReady(10, 0, 2_000_000_000))
    assertFalse(OrientationMath.windowReady(50, 0, 1_000_000_000))
    assertTrue(OrientationMath.windowReady(50, 0, 1_960_000_000))
    assertTrue(OrientationMath.stable(2.9, 3))
    assertFalse(OrientationMath.stable(3.1, 3))
    assertFalse(OrientationMath.stable(0.1, 0))
  }
}
