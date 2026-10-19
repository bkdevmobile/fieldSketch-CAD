package pl.fieldsketch.orientation

/** Gates detector events by their monotonic sensor timestamp, not delivery time. */
internal class StepWindow {
  var active = false
    private set
  var count = 0
    private set
  private var startedAt = 0L
  private var lastTimestamp = Long.MIN_VALUE

  fun start(timestamp: Long) {
    require(timestamp >= 0)
    startedAt = timestamp; lastTimestamp = timestamp - 1; count = 0; active = true
  }
  fun record(timestamp: Long): Boolean {
    if (!active || timestamp < startedAt || timestamp <= lastTimestamp) return false
    lastTimestamp = timestamp; count += 1
    return true
  }
  fun stop(): Int { active = false; return count }
}
