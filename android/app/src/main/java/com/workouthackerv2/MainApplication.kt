package com.workouthackerv2

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.workouthackerv2.heartrate.CameraHeartRatePackage
import com.workouthackerv2.tts.WorkoutTtsPackage
import com.vosk.VoskPackage // 1. ADD THIS IMPORT

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(CameraHeartRatePackage())
          add(WorkoutTtsPackage())
          add(VoskPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}