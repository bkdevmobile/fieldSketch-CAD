package com.bk.dev.mobile.billing

import android.os.Handler
import android.os.Looper
import android.util.Base64
import com.android.billingclient.api.*
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Mutable state and callbacks are serialized on the main thread. */
class OutlineGoBillingModule : Module() {
  private val handler = Handler(Looper.getMainLooper())
  private val context get() = requireNotNull(appContext.reactContext).applicationContext
  private val prefs by lazy { context.getSharedPreferences("outlinego_billing", 0) }
  private val publicKey by lazy {
    val id = context.resources.getIdentifier("outlinego_play_public_key", "string", context.packageName)
    if (id == 0) "" else context.getString(id)
  }
  private val verifier by lazy { ReceiptVerifier(publicKey, context.packageName) { Base64.decode(it, Base64.DEFAULT) } }
  private val entitlements by lazy { Entitlements(verifier::verify, { receipt ->
    if (receipt == null) prefs.edit().clear().commit()
    else prefs.edit().putString("data", receipt.data).putString("signature", receipt.signature).commit()
  }, { receipt, done ->
    client!!.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(receipt.token).build()) { result -> handler.post {
      done(result.responseCode == BillingClient.BillingResponseCode.OK)
    } }
  }, { publish("acknowledgementPending") }) }
  private var client: BillingClient? = null
  private var initialized = false
  private var closed = false
  private var plus = false
  private var price: String? = null
  private var status = "idle"
  private var processing = false
  private var syncing = false
  private var revision = 0
  private var purchaseEpoch = 0
  private var syncGeneration = 0
  private var flowGeneration = 0
  private val connections = mutableListOf<(Boolean) -> Unit>()
  private var connectionStarted = false
  private var purchaseTimeout: Runnable? = null

  private fun snapshot(): Map<String, Any?> = mapOf("plan" to if (plus) "plus" else "free",
    "ready" to initialized, "price" to price, "configured" to publicKey.isNotBlank(),
    "status" to status, "processing" to (processing || syncing), "revision" to revision)
  private fun publish(next: String = status) {
    if (closed) return
    if (next == "unavailable" || next == "unconfigured") price = null
    status = next; revision++
    sendEvent("billingChanged", snapshot())
  }
  private fun localState() {
    if (initialized) return
    entitlements.load(prefs.getString("data", "") ?: "", prefs.getString("signature", "") ?: "")
    plus = entitlements.plus
    initialized = true
  }
  private fun finishFlow() {
    flowGeneration++
    purchaseTimeout?.let { handler.removeCallbacks(it) }; purchaseTimeout = null
    processing = false
  }
  private fun connected(done: (Boolean) -> Unit) {
    if (closed) { done(false); return }
    if (publicKey.isBlank()) { publish("unconfigured"); done(false); return }
    if (client == null) client = BillingClient.newBuilder(context)
      .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
      .enableAutoServiceReconnection()
      .setListener { result, purchases -> handler.post {
        if (closed) return@post
        purchaseEpoch++; finishFlow()
        when (result.responseCode) {
          BillingClient.BillingResponseCode.OK -> {
            if (purchases == null) publish("error") else applyPurchases(purchases, false, false)
          }
          BillingClient.BillingResponseCode.USER_CANCELED -> publish("cancelled")
          BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> sync(false)
          else -> publish("error")
        }
      } }.build()
    val active = requireNotNull(client)
    if (active.isReady) { done(true); return }
    connections.add(done)
    if (connectionStarted) return
    connectionStarted = true
    val connectionTimeout = Runnable {
      if (connectionStarted) {
        connectionStarted = false
        publish("unavailable")
        val waiting = connections.toList(); connections.clear(); waiting.forEach { it(false) }
      }
    }
    handler.postDelayed(connectionTimeout, 30000)
    active.startConnection(object : BillingClientStateListener {
      override fun onBillingSetupFinished(result: BillingResult) { handler.post {
        handler.removeCallbacks(connectionTimeout)
        connectionStarted = false
        val ok = result.responseCode == BillingClient.BillingResponseCode.OK
        if (!ok) publish("unavailable")
        val waiting = connections.toList(); connections.clear(); waiting.forEach { it(ok) }
      } }
      override fun onBillingServiceDisconnected() { handler.post {
        handler.removeCallbacks(connectionTimeout)
        connectionStarted = false
        val waiting = connections.toList(); connections.clear(); waiting.forEach { it(false) }
        if (!closed) publish("unavailable")
      } }
    })
  }
  private fun loadProduct(done: (ProductDetails?, String?) -> Unit) {
    val params = QueryProductDetailsParams.newBuilder().setProductList(listOf(
      QueryProductDetailsParams.Product.newBuilder().setProductId(ReceiptVerifier.PRODUCT)
        .setProductType(BillingClient.ProductType.INAPP).build())).build()
    client!!.queryProductDetailsAsync(params) { result, response -> handler.post {
      if (closed) return@post
      val product = response.productDetailsList.firstOrNull { it.productId == ReceiptVerifier.PRODUCT }
      val offer = product?.oneTimePurchaseOfferDetailsList?.firstOrNull { it.offerId == null }
      price = if (result.responseCode == BillingClient.BillingResponseCode.OK) offer?.formattedPrice else null
      if (price == null) publish("unavailable") else publish()
      done(if (price != null) product else null, offer?.offerToken)
    } }
  }
  private fun applyPurchases(purchases: List<Purchase>, authoritative: Boolean, restore: Boolean) {
    val relevant = purchases.filter { ReceiptVerifier.PRODUCT in it.products }
    val result = entitlements.apply(relevant.map { Receipt(it.originalJson, it.signature, it.purchaseState, it.purchaseToken, it.isAcknowledged) }, authoritative, restore)
    plus = entitlements.plus
    publish(result)
  }
  private fun sync(restore: Boolean) {
    localState()
    if (syncing || processing || closed) return
    val generation = ++syncGeneration
    val timeout = Runnable {
      if (generation == syncGeneration && syncing) { syncGeneration++; syncing = false; publish("unavailable") }
    }
    handler.postDelayed(timeout, 45000)
    syncing = true; publish("syncing")
    connected { ok ->
      if (generation != syncGeneration || closed) return@connected
      if (!ok) { handler.removeCallbacks(timeout); syncing = false; publish(); return@connected }
      loadProduct { _, _ ->
        if (generation != syncGeneration || closed) return@loadProduct
        val epoch = purchaseEpoch
        client!!.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build()) { result, purchases -> handler.post {
          if (generation != syncGeneration) return@post
          syncing = false
          handler.removeCallbacks(timeout)
          if (closed || epoch != purchaseEpoch) { publish(); return@post }
          if (result.responseCode == BillingClient.BillingResponseCode.OK) applyPurchases(purchases, true, restore)
          else publish("unavailable")
        } }
      }
    }
  }
  override fun definition() = ModuleDefinition {
    Name("OutlineGoBilling")
    Events("billingChanged")
    AsyncFunction("initialize") { localState(); snapshot() }.runOnQueue(Queues.MAIN)
    AsyncFunction("refresh") { restore: Boolean -> sync(restore) }.runOnQueue(Queues.MAIN)
    AsyncFunction("purchase") { promise: Promise ->
      localState()
      if (processing || syncing || plus) { promise.resolve(null); return@AsyncFunction }
      val flow = ++flowGeneration
      processing = true; publish("purchasing")
      promise.resolve(null) // Completion is delivered through billingChanged, not this request promise.
      purchaseTimeout = Runnable { finishFlow(); publish("unavailable"); sync(false) }.also { handler.postDelayed(it, 120000) }
      connected { ok ->
        if (!processing || closed || flow != flowGeneration) return@connected
        if (!ok) { finishFlow(); publish(); return@connected }
        loadProduct { product, offerToken ->
          if (!processing || closed || flow != flowGeneration) return@loadProduct
          val activity = appContext.currentActivity
          if (product == null || offerToken == null || activity == null) {
            finishFlow(); publish("unavailable")
          } else {
            val item = BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(product).setOfferToken(offerToken).build()
            val result = client!!.launchBillingFlow(activity, BillingFlowParams.newBuilder().setProductDetailsParamsList(listOf(item)).build())
            if (result.responseCode != BillingClient.BillingResponseCode.OK) {
              finishFlow()
              if (result.responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) sync(false) else publish("error")
            }
          }
        }
      }
    }.runOnQueue(Queues.MAIN)
    OnDestroy {
      handler.post { closed = true; finishFlow(); client?.endConnection(); client = null; connections.clear() }
    }
  }
}
