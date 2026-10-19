package pl.fieldsketch.orientation

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.Manifest
import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.*

class FieldSketchOrientationModule : Module(), SensorEventListener {
  private val context by lazy { requireNotNull(appContext.reactContext).applicationContext }
  private val manager get() = context.getSystemService(android.content.Context.SENSOR_SERVICE) as SensorManager
  private val store by lazy { DiagnosticStore(context) }
  private val handler = Handler(Looper.getMainLooper())
  private data class Sample(val time: Long, val heading: Double, val projection: Double, val accuracy: Int)
  private val samples = ArrayDeque<Sample>()
  private var mode = "manual"
  private var active = false
  private var previousTime = 0L
  private var lastUi = 0L
  private var dropped = 0L
  private var warningSent = false
  private val stepWindow = StepWindow()
  private var stepMeasurementId = ""
  private val stepListener = object : SensorEventListener {
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) { }
    override fun onSensorChanged(event: SensorEvent) {
      synchronized(this@FieldSketchOrientationModule) {
        if (!active || event.sensor.type != Sensor.TYPE_STEP_DETECTOR) return
        if (event.values.firstOrNull() != 1f || !stepWindow.record(event.timestamp)) return
        try {
          store.append("step_detected", JSONObject().put("measurementId", stepMeasurementId)
            .put("sensorTimestampNs", event.timestamp.toString()).put("steps", stepWindow.count))
          store.flush()
          sendEvent("stepSample", stepResult())
        } catch (e: Exception) { fail(e) }
      }
    }
  }
  private val ticker = object : Runnable {
    override fun run() {
      if (!active) return
      try {
        store.flush()
        if (store.warning && !warningSent) {
          warningSent = true
          sendEvent("sensorStatusChanged", mapOf("status" to "warning", "message" to "Logi zajmują ponad 80 MiB. Usuń lub wyeksportuj wcześniejsze sesje."))
        }
      } catch (e: Exception) { fail(e) }
      if (active) handler.postDelayed(this, 1000)
    }
  }
  override fun definition() = ModuleDefinition {
    Name("FieldSketchOrientation")
    Events("orientationSample", "sensorStatusChanged", "stepSample")
    OnCreate { store.list() }
    AsyncFunction("getCapabilities") { capabilities() }
    AsyncFunction("startSession") { options: String -> start(JSONObject(options)) }
    AsyncFunction("stopSession") { stop("user") }
    AsyncFunction("captureDirection") { capture() }
    AsyncFunction("startStepMeasurement") { sessionId: String -> startSteps(sessionId) }
    AsyncFunction("stopStepMeasurement") { measurementId: String -> stopSteps("user", measurementId) }
    AsyncFunction("appendEvent") { type: String, payload: String ->
      synchronized(this@FieldSketchOrientationModule) {
        try { store.append(type, JSONObject(payload)); store.flush() }
        catch (e: Exception) { fail(e); throw e }
      }
    }
    AsyncFunction("listLogs") { store.list() }
    AsyncFunction("deleteLog") { id: String -> store.delete(id) }
    AsyncFunction("snapshotLog") { id: String -> store.snapshot(id) }
    AsyncFunction("readLogPart") { token: String, index: Int -> store.part(token, index) }
    OnActivityEntersBackground { stopSafely("background") }
    OnDestroy { stopSafely("destroy") }
  }
  private fun capabilities(): Map<String, Any> = mapOf(
    "magnetic" to (manager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR) != null),
    "relative" to (manager.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR) != null),
    "stepDetector" to (manager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR) != null),
    "device" to "${Build.MANUFACTURER} ${Build.MODEL}", "android" to Build.VERSION.RELEASE
  )
  @Synchronized private fun start(options: JSONObject): Map<String, Any> {
    stop("new_session")
    mode = options.getString("mode")
    require(mode in listOf("manual", "magnetic", "relative")) { "Nieznany tryb kierunku" }
    val type = if (mode == "relative") Sensor.TYPE_GAME_ROTATION_VECTOR else Sensor.TYPE_ROTATION_VECTOR
    val sensor = if (mode == "manual") null else manager.getDefaultSensor(type)
    check(mode == "manual" || sensor != null) { "Urządzenie nie obsługuje tego sensora. Wybierz tryb ręczny." }
    val header = JSONObject(options.toString()).put("device", JSONObject(capabilities())).put("appVersion", "0.1.0")
      .put("algorithmVersion", 1).put("samplingHz", 25).put("windowMs", 2000).put("stdDevThresholdDeg", 3)
      .put("minimumHorizontalProjection", 0.2).put("aimingAxis", "rear camera -Z in Android device frame")
      .put("rotationVectorOrder", "x,y,z,optional w,optional headingAccuracyRad")
      .put("sensor", sensor?.let { JSONObject().put("name", it.name).put("vendor", it.vendor).put("version", it.version).put("type", it.type) } ?: JSONObject.NULL)
    val sid = store.start(options.getString("projectId"), header)
    active = true; samples.clear(); previousTime = 0; dropped = 0; warningSent = false
    if (sensor != null && !manager.registerListener(this, sensor, 40000, handler)) {
      stop("registration_failed"); error("Nie udało się uruchomić sensora")
    }
    handler.post(ticker)
    return mapOf("sessionId" to sid, "mode" to mode)
  }
  @Synchronized private fun stop(reason: String) {
    stopSteps(reason)
    manager.unregisterListener(this); handler.removeCallbacks(ticker); active = false; samples.clear()
    store.stop(reason)
    if (reason != "new_session") sendEvent("sensorStatusChanged", mapOf("status" to "stopped", "reason" to reason))
  }
  private fun stopSafely(reason: String) { try { stop(reason) } catch (e: Exception) { fail(e) } }
  @Synchronized private fun fail(e: Exception) {
    stepWindow.stop(); manager.unregisterListener(stepListener)
    manager.unregisterListener(this); handler.removeCallbacks(ticker); active = false; samples.clear()
    try { store.append("recording_error", JSONObject().put("message", e.message ?: "Unknown error")) } catch (_: Exception) { }
    try { store.stop("error") } catch (_: Exception) { }
    sendEvent("sensorStatusChanged", mapOf("status" to "error", "message" to (e.message ?: "Błąd rejestracji")))
  }
  private fun stepResult(): Map<String, Any> = mapOf("measurementId" to stepMeasurementId, "steps" to stepWindow.count,
    "active" to stepWindow.active, "sessionId" to (store.sessionId ?: ""))
  @Synchronized private fun startSteps(expectedSessionId: String): Map<String, Any> {
    check(active && store.sessionId == expectedSessionId) { "Rozpocznij sesję i przechwyć kierunek przed liczeniem kroków." }
    check(!stepWindow.active) { "Pomiar kroków jest już aktywny." }
    check(Build.VERSION.SDK_INT < 29 || context.checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED) {
      "Krokomierz wymaga zgody na rozpoznawanie aktywności. Możesz wpisać długość ręcznie."
    }
    val sensor = manager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR)
      ?: error("Brak detektora kroków. Wpisz długość lub liczbę kroków ręcznie.")
    stepMeasurementId = java.util.UUID.randomUUID().toString()
    stepWindow.start(SystemClock.elapsedRealtimeNanos())
    if (!manager.registerListener(stepListener, sensor, SensorManager.SENSOR_DELAY_NORMAL, 0, handler)) {
      stepWindow.stop(); error("Nie udało się uruchomić krokomierza.")
    }
    try {
      store.append("step_measurement_started", JSONObject(stepResult()).put("sensor", sensor.name))
      store.flush()
    } catch (e: Exception) { fail(e); throw e }
    return stepResult()
  }
  @Synchronized private fun stopSteps(reason: String, expectedMeasurementId: String? = null): Map<String, Any> {
    check(expectedMeasurementId == null || expectedMeasurementId == stepMeasurementId) { "Pomiar kroków zmienił się." }
    val wasActive = stepWindow.active
    stepWindow.stop(); manager.unregisterListener(stepListener)
    val result = stepResult()
    if (wasActive) {
      try { store.append("step_measurement_stopped", JSONObject(result).put("reason", reason)); store.flush() }
      catch (e: Exception) { fail(e); throw e }
      sendEvent("stepSample", result)
    }
    return result
  }
  @Synchronized override fun onSensorChanged(event: SensorEvent) {
    if (!active) return
    try {
      val r = FloatArray(9)
      SensorManager.getRotationMatrixFromVector(r, event.values)
      // Android rotation matrix maps device coordinates into East/North/Up.
      // Rear camera looks down device -Z: projected direction = (-R02, -R12).
      val direction = OrientationMath.cameraDirection(r)
      val projection = direction.projection; val heading = direction.heading
      val gap = if (previousTime == 0L) 0L else event.timestamp - previousTime
      if (gap > 100_000_000) dropped += max(0L, gap / 40_000_000 - 1)
      previousTime = event.timestamp
      samples.addLast(Sample(event.timestamp, heading, projection, event.accuracy))
      while (samples.isNotEmpty() && event.timestamp - samples.first().time > 2_000_000_000) samples.removeFirst()
      val data = JSONObject().put("sensorTimestampNs", event.timestamp.toString()).put("sensorType", event.sensor.type)
        .put("values", JSONArray(event.values.map { it.toDouble() })).put("rotationMatrix", JSONArray(r.map { it.toDouble() }))
        .put("headingRad", heading).put("horizontalProjection", projection).put("pitchRad", direction.pitch)
        .put("accuracy", event.accuracy).put("screenRotation", 0).put("intervalNs", gap.toString()).put("droppedEstimate", dropped)
      store.append("orientation_sample", data)
      if (store.warning && !warningSent) { warningSent = true; sendEvent("sensorStatusChanged", mapOf("status" to "warning", "message" to "Logi zajmują ponad 80 MiB. Usuń lub wyeksportuj wcześniejsze sesje.")) }
      if (event.timestamp - lastUi > 200_000_000) {
        lastUi = event.timestamp
        val stats = statistics()
        sendEvent("orientationSample", mapOf("headingRad" to heading, "pitchDeg" to Math.toDegrees(direction.pitch),
          "horizontalProjection" to projection, "accuracy" to event.accuracy, "stdDevDeg" to stats.second,
          "sampleCount" to samples.size, "ready" to ready(), "sessionId" to (store.sessionId ?: "")))
      }
    } catch (e: Exception) { fail(e) }
  }
  private fun ready() = samples.isNotEmpty() && OrientationMath.windowReady(samples.size, samples.first().time, samples.last().time)
  private fun statistics(): Pair<Double, Double> {
    return OrientationMath.circularStats(samples.map { it.heading })
  }
  @Synchronized private fun capture(): Map<String, Any> {
    check(active && mode != "manual") { "Brak aktywnego sensora" }
    check(ready()) { "Celuj nieruchomo przez co najmniej 2 sekundy" }
    check(SystemClock.elapsedRealtimeNanos() - samples.last().time < 500_000_000) { "Próbki są nieaktualne" }
    check(samples.all { it.projection >= 0.2 }) { "Zmień pochylenie telefonu. Celowanie jest zbyt pionowe." }
    val (heading, std) = statistics()
    val quality = samples.minOf { it.accuracy }
    val result = mapOf<String, Any>("headingRad" to heading, "stdDevDeg" to std, "accuracy" to quality,
      "sampleCount" to samples.size, "horizontalProjection" to samples.minOf { it.projection },
      "stable" to OrientationMath.stable(std, quality), "sessionId" to (store.sessionId ?: ""), "timestampUtc" to utcNow())
    store.append("direction_captured", JSONObject(result).put("firstSampleNs", samples.first().time.toString()).put("lastSampleNs", samples.last().time.toString()))
    store.flush(); return result
  }
  @Synchronized override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
    if (active) try { store.append("accuracy_changed", JSONObject().put("sensorType", sensor?.type).put("accuracy", accuracy)) } catch (e: Exception) { fail(e) }
  }
}
