package com.workouthackerv2.tts

import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Locale
import java.util.UUID

class WorkoutTtsModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  private var textToSpeech: TextToSpeech? = null
  private var isReady = false
  private val pendingSpeaks = ArrayDeque<PendingSpeak>()

  private data class PendingSpeak(
    val text: String,
    val promise: Promise,
  )

  override fun getName(): String = "WorkoutTtsModule"

  override fun initialize() {
    super.initialize()
    ensureEngine()
  }

  @ReactMethod
  fun speak(text: String, promise: Promise) {
    if (text.isBlank()) {
      promise.reject("TTS_EMPTY", "Speech text cannot be empty")
      return
    }

    val engine = textToSpeech
    if (engine != null && isReady) {
      speakNow(text, promise)
      return
    }

    pendingSpeaks.addLast(PendingSpeak(text, promise))
    ensureEngine()
  }

  @ReactMethod
  fun stop(promise: Promise) {
    try {
      textToSpeech?.stop()
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("TTS_STOP_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun shutdown(promise: Promise) {
    try {
      textToSpeech?.stop()
      textToSpeech?.shutdown()
      textToSpeech = null
      isReady = false
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("TTS_SHUTDOWN_FAILED", error.message, error)
    }
  }

  private fun ensureEngine() {
    if (textToSpeech != null) {
      return
    }

    textToSpeech = TextToSpeech(context) { status ->
      isReady = status == TextToSpeech.SUCCESS
      if (!isReady) {
        flushPendingFailure("Text-to-speech engine failed to initialize")
        return@TextToSpeech
      }

      textToSpeech?.language = Locale.US
      textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
        override fun onStart(utteranceId: String?) = Unit

        override fun onDone(utteranceId: String?) = Unit

        override fun onError(utteranceId: String?) = Unit
      })

      flushPendingSuccess()
    }
  }

  private fun speakNow(text: String, promise: Promise) {
    val engine = textToSpeech
    if (engine == null || !isReady) {
      pendingSpeaks.addLast(PendingSpeak(text, promise))
      ensureEngine()
      return
    }

    val utteranceId = UUID.randomUUID().toString()
    val speakResult = engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    if (speakResult == TextToSpeech.SUCCESS) {
      promise.resolve(null)
    } else {
      promise.reject("TTS_SPEAK_FAILED", "Text-to-speech speak request failed")
    }
  }

  private fun flushPendingSuccess() {
    while (pendingSpeaks.isNotEmpty()) {
      val pending = pendingSpeaks.removeFirst()
      speakNow(pending.text, pending.promise)
    }
  }

  private fun flushPendingFailure(message: String) {
    while (pendingSpeaks.isNotEmpty()) {
      pendingSpeaks.removeFirst().promise.reject("TTS_INIT_FAILED", message)
    }
  }

  override fun invalidate() {
    try {
      textToSpeech?.stop()
      textToSpeech?.shutdown()
    } finally {
      textToSpeech = null
      isReady = false
      pendingSpeaks.clear()
      super.invalidate()
    }
  }
}