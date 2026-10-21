package com.bk.dev.mobile.billing

data class Receipt(val data: String, val signature: String, val state: Int, val token: String,
  val acknowledged: Boolean = false)

/** A store failure must never acknowledge an entitlement which was not delivered. */
class Entitlements(private val verify: (String, String) -> Boolean,
  private val save: (Receipt?) -> Boolean,
  private val acknowledge: (Receipt, (Boolean) -> Unit) -> Unit,
  private val acknowledgementFailed: () -> Unit) {
  var plus = false; private set
  private val inFlight = mutableSetOf<String>()
  private val acknowledged = mutableSetOf<String>()
  fun load(data: String, signature: String) { plus = verify(data, signature) }
  fun apply(receipts: List<Receipt>, authoritative: Boolean, restore: Boolean): String {
    val valid = receipts.filter { it.state == 1 && verify(it.data, it.signature) }
    if (valid.isNotEmpty()) {
      if (!save(valid.first())) return "error"
      plus = true
      valid.forEach { receipt ->
        if (!receipt.acknowledged && receipt.token !in acknowledged && inFlight.add(receipt.token)) {
          acknowledge(receipt) { success ->
            inFlight.remove(receipt.token)
            if (success) acknowledged.add(receipt.token) else acknowledgementFailed()
          }
        }
      }
      return if (restore) "restored" else "purchased"
    }
    if (receipts.any { it.state == 1 }) return "verificationFailed"
    if (receipts.any { it.state == 2 }) return "pending"
    if (authoritative) {
      if (!save(null)) return "error"
      plus = false
      return if (restore) "noPurchases" else "idle"
    }
    return "error"
  }
}
