# WiFi-ESP Connection Module

**WiFi-based sensor streaming for ESP32 devices** - Replaces Bluetooth with HTTP polling over WiFi AP.

## Features

- ✅ **Global Sensor Data** - Any model/component can access sensor data without component tree constraints
- ✅ **WiFi HTTP Polling** - Reliable WiFi connection with fallback retry logic
- ✅ **EMG & IMU Support** - Built-in packet parsing for EMG and IMU sensors
- ✅ **Zero Configuration** - Works out of the box with sensible defaults
- ✅ **Multi-subscriber** - Multiple models/features can subscribe to the same data stream
- ✅ **Error Handling** - Built-in error recovery and status management
- ✅ **Auto-connect WiFi** - Optional helper can join the ESP32 AP using SSID/password

## Quick Start

### 1. Wrap Your App

```tsx
import { WiFiSensorBridge } from './ESP-connection-main/src';

export default function App() {
  return (
    <WiFiSensorBridge 
      baseUrl="http://192.168.4.1"
      espSsid="ESP32-Sensors"
      espPassword="sensors123"
      autoConnect={true}
      pollIntervalMs={50}
      onStatusChange={(status) => console.log('Sensor status:', status)}
      onError={(error) => console.error('Sensor error:', error)}
    >
      {/* Your app */}
    </WiFiSensorBridge>
  );
}
```

## Auto-Connect Setup

The bridge can try to join the ESP32 access point automatically using:

- SSID: `ESP32-Sensors`
- Password: `sensors123`

### Android

Add these permissions to your app manifest:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
```

On Android 6+ the OS typically requires location permission before WiFi changes are allowed.

### iOS

- Install the WiFi join library in the app that consumes this module.
- Add the required WiFi/location usage strings in `Info.plist` if you query network state.
- The system may still show a confirmation sheet when joining the network.

### 2. Use in Any Component

```tsx
import { useEMGPackets, useWiFiSensorStatus } from './ESP-connection-main/src';

function MyComponent() {
  const status = useWiFiSensorStatus();

  useEMGPackets((packet) => {
    console.log('EMG Data:', {
      rawSignal: packet.rawSignal,
      butterworth: packet.butterworthFiltered,
      rms: packet.rmsFiltered,
      wearing: packet.wearingDetection,
      timestamp: packet.timestamp,
    });
  });

  return <Text>Status: {status}</Text>;
}
```

## API Reference

### Components

#### `<WiFiSensorBridge>`

Main component that manages WiFi polling lifecycle. Place this at the top level of your app.

**Props:**

- `baseUrl?: string` - ESP32 HTTP server URL (default: `http://192.168.4.1`)
- `espSsid?: string` - ESP32 WiFi SSID (default: `ESP32-Sensors`)
- `espPassword?: string` - ESP32 WiFi password (default: `sensors123`)
- `autoConnect?: boolean` - Attempt to join the ESP32 network on mount (default: `true`)
- `pollIntervalMs?: number` - Polling interval in ms (default: `50`)
- `onStatusChange?: (status: WiFiSensorStatus) => void` - Status updates
- `onError?: (error: Error) => void` - Error notifications
- `children?: React.ReactNode` - Child components

**Status Values:**

- `'idle'` - Not yet started
- `'connecting'` - Initial connection attempt
- `'connected'` - Successfully connected
- `'error'` - Connection error
- `'disconnected'` - Intentionally stopped

### Hooks

#### `useWiFiSensorStatus(): WiFiSensorStatus`

Get current connection status.

```tsx
const status = useWiFiSensorStatus();
// 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'
```

#### `useSensorPackets(onPacket: (packet: SensorPacket) => void): void`

Subscribe to all sensor packets (EMG and IMU).

```tsx
useSensorPackets((packet) => {
  if (packet.sensor === 'EMG') {
    console.log('EMG:', packet.rawSignal);
  } else if (packet.sensor === 'IMU') {
    console.log('IMU:', packet.roll, packet.pitch, packet.yaw);
  }
});
```

#### `useEMGPackets(onPacket: (packet: EMGPacket) => void): void`

Subscribe to EMG packets only.

```tsx
useEMGPackets((packet) => {
  console.log('EMG Packet:', {
    rawSignal: packet.rawSignal,
    butterworth: packet.butterworthFiltered,
    rms: packet.rmsFiltered,
    wearing: packet.wearingDetection,
  });
});
```

#### `useIMUPackets(onPacket: (packet: IMUPacket) => void): void`

Subscribe to IMU packets only.

```tsx
useIMUPackets((packet) => {
  console.log('IMU Packet:', {
    roll: packet.roll,
    pitch: packet.pitch,
    yaw: packet.yaw,
  });
});
```

#### `useWiFiSensorState(): { status: WiFiSensorStatus; error: Error | null }`

Get status and recent error together.

```tsx
const { status, error } = useWiFiSensorState();
if (error) {
  console.error('Recent error:', error.message);
}
```

### Service (Advanced)

For direct service access without hooks:

```tsx
import { WiFiSensorService } from './ESP-connection-main/src';

// Configure
WiFiSensorService.configure({
  baseUrl: 'http://192.168.4.1',
  pollIntervalMs: 50,
});

// Start
WiFiSensorService.start();

// Subscribe
const unsubscribe = WiFiSensorService.subscribeSensorData((packet) => {
  console.log('Packet:', packet);
});

// Cleanup
unsubscribe();
WiFiSensorService.stop();
```

## Integration Checklist

- [ ] Copy `ESP-connection-main/src` to your project
- [ ] Add `<WiFiSensorBridge>` to your app root
- [ ] Update imports from old Bluetooth module to new WiFi module
- [ ] Replace `useEMGPackets` calls to pass full packet instead of just values
- [ ] Replace `useIMUPackets` calls to pass full packet instead of just values
- [ ] Add `useWiFiSensorStatus()` to show connection state
- [ ] Test multiple components subscribing to the same data
- [ ] Update error handling for new `WiFiSensorStatus` states
