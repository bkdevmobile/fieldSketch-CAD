package com.bk.dev.mobile.billing

import java.security.KeyFactory
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import org.json.JSONObject

/** Verify the original Play JSON, including receipts loaded offline. */
class ReceiptVerifier(private val publicKey: String, private val packageName: String,
  private val decode: (String) -> ByteArray) {
  fun verify(data: String, signature: String): Boolean = try {
    val key = KeyFactory.getInstance("RSA").generatePublic(X509EncodedKeySpec(decode(publicKey)))
    val verifier = Signature.getInstance("SHA1withRSA") // Play receipt signature, independent of APK signing.
    verifier.initVerify(key)
    verifier.update(data.toByteArray(Charsets.UTF_8))
    val json = JSONObject(data)
    verifier.verify(decode(signature)) && json.optString("packageName") == packageName &&
      json.optString("productId") == PRODUCT && json.optInt("purchaseState", -1) == 0 &&
      json.optString("purchaseToken", json.optString("token")).isNotBlank() && json.optInt("quantity", 1) == 1
  } catch (_: Exception) { false }
  companion object { const val PRODUCT = "outlinego_plus" }
}
