package com.bk.dev.mobile.billing

import org.junit.Assert.*
import org.junit.Test

class EntitlementsTest {
  private var disk: Receipt? = null
  private var saveWorks = true
  private var calls = 0
  private var failures = 0
  private var completion: ((Boolean) -> Unit)? = null
  private val receipt = Receipt("signed", "valid", 1, "test-token")
  private fun manager() = Entitlements({ data, sig -> data == "signed" && sig == "valid" }, {
    if (saveWorks) disk = it
    saveWorks
  }, { _, done -> calls++; completion = done }, { failures++ })

  @Test fun purchaseIsPersistedAndDuplicateEventsDoNotDuplicateAcknowledgement() {
    val manager = manager()
    assertEquals("purchased", manager.apply(listOf(receipt), false, false))
    assertTrue(manager.plus); assertEquals(receipt, disk); assertEquals(1, calls)
    manager.apply(listOf(receipt), true, false); assertEquals(1, calls)
    completion!!(true)
    manager.apply(listOf(receipt), true, false); assertEquals(1, calls)
  }
  @Test fun failedAcknowledgementRetriesOnNextSyncWithoutRemovingPlus() {
    val manager = manager(); manager.apply(listOf(receipt), false, false)
    completion!!(false); assertEquals(1, failures); assertTrue(manager.plus)
    manager.apply(listOf(receipt), true, false); assertEquals(2, calls)
  }
  @Test fun interruptedAppRestoresReceiptOfflineAndCanAcknowledgeAgain() {
    manager().apply(listOf(receipt), false, false)
    val restarted = manager(); restarted.load(disk!!.data, disk!!.signature)
    assertTrue(restarted.plus)
    assertEquals("restored", restarted.apply(listOf(receipt), true, true)); assertEquals(2, calls)
  }
  @Test fun pendingCancellationOrInvalidReceiptCannotGrantPlus() {
    val manager = manager()
    assertEquals("pending", manager.apply(listOf(receipt.copy(state = 2)), false, false))
    assertFalse(manager.plus); assertEquals(0, calls); assertNull(disk)
    manager.apply(emptyList(), false, false); assertFalse(manager.plus)
    assertEquals("verificationFailed", manager.apply(listOf(receipt.copy(signature = "wrong")), true, true))
    assertFalse(manager.plus)
  }
  @Test fun onlyAuthoritativeAbsenceRemovesCachedPlus() {
    val manager = manager(); manager.load("signed", "valid")
    manager.apply(emptyList(), false, false); assertTrue(manager.plus)
    manager.apply(listOf(receipt.copy(signature = "wrong")), true, false); assertTrue(manager.plus)
    assertEquals("noPurchases", manager.apply(emptyList(), true, true)); assertFalse(manager.plus)
  }
  @Test fun failedPersistenceDoesNotGrantOrAcknowledgePurchase() {
    saveWorks = false; val manager = manager()
    assertEquals("error", manager.apply(listOf(receipt), true, false))
    assertFalse(manager.plus); assertEquals(0, calls)
  }
  @Test fun acknowledgedPurchaseRestoresWithoutAnotherAcknowledgement() {
    val manager = manager()
    assertEquals("restored", manager.apply(listOf(receipt.copy(acknowledged = true)), true, true))
    assertTrue(manager.plus); assertEquals(0, calls)
  }
  @Test fun pendingResponseAndFailedRevocationWritePreserveCachedPlus() {
    val manager = manager(); manager.load("signed", "valid")
    manager.apply(listOf(receipt.copy(state = 2)), true, false); assertTrue(manager.plus)
    saveWorks = false
    assertEquals("error", manager.apply(emptyList(), true, false)); assertTrue(manager.plus)
  }
}
