package pl.fieldsketch.orientation

import org.junit.Assert.*
import org.junit.Test

class StepWindowTest {
  @Test fun ignoresEventsOutsideTheMeasurementAndDuplicates() {
    val window = StepWindow()
    assertFalse(window.record(99))
    window.start(100)
    assertFalse(window.record(99))
    assertTrue(window.record(100))
    assertFalse(window.record(100))
    assertTrue(window.record(110))
    assertFalse(window.record(105))
    assertEquals(2, window.stop())
    assertFalse(window.record(120))
    assertEquals(2, window.count)
  }
  @Test fun newMeasurementResetsCountAndRejectsQueuedPreviousEvents() {
    val window = StepWindow()
    window.start(100); window.record(101); window.stop()
    window.start(200)
    assertEquals(0, window.count)
    assertFalse(window.record(150))
    assertTrue(window.record(201))
    assertEquals(1, window.stop())
  }
}
