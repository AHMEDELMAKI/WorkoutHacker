# WiFi Sensor Integration - Main App Guide

This guide explains how to integrate the WiFi sensor module into the main test-workout app.

## Step 1: Update Main App.tsx

Wrap your entire app with `WiFiSensorBridge` to enable global sensor data access:

```tsx
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { WiFiSensorBridge } from './ESP-connection-main/src';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <WiFiSensorBridge 
      baseUrl="http://192.168.4.1"
      pollIntervalMs={50}
      onStatusChange={(status) => {
        console.log('[WiFi Sensor]', status);
      }}
      onError={(error) => {
        console.error('[WiFi Sensor Error]', error.message);
      }}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </WiFiSensorBridge>
  );
}
```

## Step 2: Update Fatigue Model Integration

The Fatigue-with-HeartRate model already has a WiFiSensorBridge. Now both can use the global service:

### Current Location
`Fatigue-with-HeartRate-main/src/react-native/WiFiSensorBridge.tsx`

Since you're making the module global, you have two options:

**Option A: Keep both for backward compatibility**
- The main app's `WiFiSensorBridge` starts the global service
- Fatigue module's `WiFiSensorBridge` becomes optional (can still exist)

**Option B: Consolidate (Recommended)**
- Update Fatigue module to use the global service only
- Remove its local WiFiSensorBridge component

### Option B Implementation (Recommended)

Update fatigue model to use global hooks:

```tsx
// In Fatigue-with-HeartRate model components
import { 
  useEMGPackets, 
  useIMUPackets,
  useWiFiSensorStatus 
} from '../../ESP-connection-main/src';

export function FatigueModel() {
  const sensorStatus = useWiFiSensorStatus();

  useEMGPackets((packet) => {
    // Process EMG data
    processFatigueEMG(packet);
  });

  useIMUPackets((packet) => {
    // Process IMU data
    processFatigueIMU(packet);
  });

  return (
    <View>
      <Text>Sensor Status: {sensorStatus}</Text>
      {/* Fatigue UI */}
    </View>
  );
}
```

## Step 3: Add Global Sensor Context (Optional but Recommended)

For easy access throughout the app without hooks, create a global context:

```tsx
// src/services/sensorDataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { WiFiSensorService, SensorPacket } from '../ESP-connection-main/src';

interface SensorDataContextType {
  lastEMGPacket: SensorPacket | null;
  lastIMUPacket: SensorPacket | null;
  sensorStatus: 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';
}

const SensorDataContext = createContext<SensorDataContextType | null>(null);

export function SensorDataProvider({ children }: { children: React.ReactNode }) {
  const [lastEMGPacket, setLastEMGPacket] = useState<SensorPacket | null>(null);
  const [lastIMUPacket, setLastIMUPacket] = useState<SensorPacket | null>(null);
  const [sensorStatus, setSensorStatus] = useState('idle');

  useEffect(() => {
    const unsubscribeData = WiFiSensorService.subscribeSensorData((packet) => {
      if (packet.sensor === 'EMG') {
        setLastEMGPacket(packet);
      } else if (packet.sensor === 'IMU') {
        setLastIMUPacket(packet);
      }
    });

    const unsubscribeStatus = WiFiSensorService.subscribeStatus(setSensorStatus);

    return () => {
      unsubscribeData();
      unsubscribeStatus();
    };
  }, []);

  return (
    <SensorDataContext.Provider value={{ lastEMGPacket, lastIMUPacket, sensorStatus }}>
      {children}
    </SensorDataContext.Provider>
  );
}

export function useSensorData() {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorData must be used within SensorDataProvider');
  }
  return context;
}
```

Then use it:

```tsx
// In any component
import { useSensorData } from './services/sensorDataContext';

function MyComponent() {
  const { lastEMGPacket, lastIMUPacket, sensorStatus } = useSensorData();
  
  return (
    <View>
      <Text>Status: {sensorStatus}</Text>
      <Text>Last EMG: {lastEMGPacket?.rawSignal}</Text>
    </View>
  );
}
```

## Step 4: Example - Add Sensor Status UI

Create a sensor status indicator component:

```tsx
// src/components/SensorStatusIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWiFiSensorStatus } from '../ESP-connection-main/src';
import { colors } from '../theme/colors';

export function SensorStatusIndicator() {
  const status = useWiFiSensorStatus();

  const statusColor = {
    idle: colors.gray,
    connecting: colors.yellow,
    connected: colors.green,
    error: colors.red,
    disconnected: colors.gray,
  }[status];

  const statusText = {
    idle: 'WiFi Idle',
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Error',
    disconnected: 'Disconnected',
  }[status];

  return (
    <View style={[styles.container, { backgroundColor: statusColor }]}>
      <Text style={styles.text}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
```

Add to your header or bottom nav:

```tsx
<View style={styles.header}>
  <Text>Test Workout</Text>
  <SensorStatusIndicator />
</View>
```

## Step 5: Multiple Models - Data Distribution

Now any new model can access sensor data:

```tsx
// Example: Adding a new injury detection model

import { useEMGPackets } from '../ESP-connection-main/src';

function InjuryDetectionModel() {
  useEMGPackets((packet) => {
    // Both fatigue and injury detection models
    // receive the same EMG data independently
    analyzeForInjuryRisk(packet);
  });

  return <InjuryDetectionUI />;
}
```

## Architecture Diagram

```
App.tsx
  └── WiFiSensorBridge (starts global polling)
      └── WiFiSensorService (singleton - distributes data)
          ├── FatigueModel (subscribes to EMG/IMU)
          ├── InjuryDetectionModel (subscribes to EMG/IMU)
          ├── ProgressTracking (subscribes to IMU)
          └── SensorStatusUI (subscribes to status)
```

## Key Points

1. **Single Bridge**: Only one `WiFiSensorBridge` at app root
2. **Multiple Subscribers**: Any component can use hooks without constraints
3. **Global Service**: `WiFiSensorService` manages all subscriptions
4. **Automatic Cleanup**: Hooks handle subscription/unsubscription
5. **Decoupled Design**: Models don't know about each other

## Cleanup

### Files to Remove (if using Option B)

From `Fatigue-with-HeartRate-main`:
- `src/react-native/WiFiSensorBridge.tsx` (no longer needed)
- `src/react-native/index.ts` (update exports if they reference WiFiSensorBridge)

Keep:
- Everything else in `Fatigue-with-HeartRate-main`

### Files to Keep

In `ESP-connection-main`:
- All files in `src/services`
- `src/WiFiSensorBridge.tsx`
- `src/hooks.ts`
- `src/utils/packetParser.ts`
- `src/index.ts`

Note: Old Bluetooth files are marked for cleanup but may still exist:
- `src/BluetoothESPConnection.tsx` (deprecated)
- `src/utils/bluetoothClient.ts` (deprecated)
- `src/types/react-native-bluetooth-classic.d.ts` (deprecated)

## Testing

```tsx
// Test with a simple component
import { useEMGPackets, useIMUPackets } from '../ESP-connection-main/src';

export function SensorTest() {
  const [emgCount, setEmgCount] = useState(0);
  const [imuCount, setImuCount] = useState(0);

  useEMGPackets(() => setEmgCount(c => c + 1));
  useIMUPackets(() => setImuCount(c => c + 1));

  return (
    <View>
      <Text>EMG Packets: {emgCount}</Text>
      <Text>IMU Packets: {imuCount}</Text>
    </View>
  );
}
```

Expected: Both counters should increment when WiFi sensor is connected.

## Common Issues

### Issue: "Module not found" for WiFi service

**Solution**: Ensure paths match your project structure. Adjust imports as needed:

```tsx
// If in different location, use relative paths:
import { WiFiSensorBridge } from '../../ESP-connection-main/src';
```

### Issue: No data flowing through

**Solution**: 
1. Verify ESP32 is on and accessible at `http://192.168.4.1/data`
2. Check `WiFiSensorBridge` status callback for errors
3. Ensure hooks are called from components that mounted after bridge

### Issue: Multiple bridges created

**Solution**: Ensure only one `<WiFiSensorBridge>` at app root, not in multiple places.

## Next Steps

1. ✅ Integrate WiFiSensorBridge in App.tsx
2. ✅ Test sensor data flow
3. ✅ Add SensorStatusIndicator to UI
4. ✅ Update Fatigue model to use global hooks
5. ✅ Add new models with data access
6. ✅ Remove old Bluetooth component references
