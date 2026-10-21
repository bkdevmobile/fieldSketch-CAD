package com.bk.dev.mobile.billing

import java.security.KeyPairGenerator
import java.security.Signature
import java.util.Base64
import org.junit.Assert.*
import org.junit.Test

class ReceiptVerifierTest {
  private val pair = KeyPairGenerator.getInstance("RSA").apply { initialize(2048) }.generateKeyPair()
  private val key = Base64.getEncoder().encodeToString(pair.public.encoded)
  private val verifier = ReceiptVerifier(key, "com.bk.dev.mobile.outlinego") { Base64.getDecoder().decode(it) }
  private fun data(product: String = "outlinego_plus", pkg: String = "com.bk.dev.mobile.outlinego", state: Int = 0, token: String = "test-token") =
    """{"productId":"$product","packageName":"$pkg","purchaseState":$state,"purchaseToken":"$token"}"""
  private fun sign(data: String): String {
    val signer = Signature.getInstance("SHA1withRSA")
    signer.initSign(pair.private); signer.update(data.toByteArray(Charsets.UTF_8))
    return Base64.getEncoder().encodeToString(signer.sign())
  }
  @Test fun validSignedReceiptCanBeVerifiedAgainOffline() {
    val data = data(); val sig = sign(data)
    assertTrue(verifier.verify(data, sig))
    assertTrue(ReceiptVerifier(key, "com.bk.dev.mobile.outlinego") { Base64.getDecoder().decode(it) }.verify(data, sig))
  }
  @Test fun changedDataAndInvalidSignaturesAreRejected() {
    val data = data()
    assertFalse(verifier.verify(data + " ", sign(data)))
    assertFalse(verifier.verify(data, "invalid"))
    assertFalse(ReceiptVerifier("", "com.bk.dev.mobile.outlinego") { Base64.getDecoder().decode(it) }.verify(data, sign(data)))
  }
  @Test fun wrongProductPackagePendingAndMissingTokenAreRejectedEvenWhenSigned() {
    listOf(data(product = "other"), data(pkg = "other"), data(state = 4), data(state = 1), data(token = ""))
      .forEach { assertFalse(verifier.verify(it, sign(it))) }
  }
}
