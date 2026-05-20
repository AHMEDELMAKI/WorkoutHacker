/**
 * MIGRATION GUIDE
 * 
 * How to migrate from the old BluetoothProvider context architecture
 * to the new self-contained BluetoothESPConnection component.
 */

// ============================================================================
// BEFORE: Old Architecture (Context Provider Pattern)
// ============================================================================

// Old index.tsx
/*
import React from 'react';
import { SafeAreaView } from 'react-native';
import { BluetoothProvider } from './BluetoothProvider';
import MainScreen from './MainScreen';

export default function App() {
  return (
    <BluetoothProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <MainScreen />
      </SafeAreaView>
    </BluetoothProvider>
  );
}
*/

// Old MainScreen.tsx (had to use hooks)
/*
import React, { useCallback } from 'react';
import { View, Text, Button } from 'react-native';
import { useBluetooth, useBluetoothPacketStream, SensorPacket } from './BluetoothProvider';

export default function MainScreen() {
  const { status, connected, connect, disconnect } = useBluetooth();
  
  const handlePacket = useCallback((packet: SensorPacket) => {
    console.log(packet);
  }, []);
  
  useBluetoothPacketStream(handlePacket);
  
  return (
    <View>
      <Text>{status}</Text>
      {!connected && <Button title="Connect" onPress={connect} />}
      {connected && <Button title="Disconnect" onPress={disconnect} />}
    </View>
  );
}
*/

// ============================================================================
// AFTER: New Architecture (Self-Contained Component)
// ============================================================================

// New App.tsx (simplified)
import React, { useCallback } from 'react';
import { SafeAreaView, View, Text, Button } from 'react-native';
import BluetoothESPConnection, { BluetoothStatus, SensorPacket } from './src';

export default function App() {
  const handlePacket = useCallback((packet: SensorPacket) => {
    console.log(packet);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BluetoothESPConnection onPacket={handlePacket}>
        {(
          status: BluetoothStatus,
          connected: boolean,
          { connect, disconnect }: { connect: () => Promise<void>; disconnect: () => Promise<void> },
        ) => (
          <View>
            <Text>{status}</Text>
            {!connected && <Button title="Connect" onPress={connect} />}
            {connected && <Button title="Disconnect" onPress={disconnect} />}
          </View>
        )}
      </BluetoothESPConnection>
    </SafeAreaView>
  );
}

// ============================================================================
// Key Differences
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────┐
│                 OLD vs NEW Architecture                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ OLD:                                                          │
│ • Context provider wraps entire app                          │
│ • Required <BluetoothProvider> at top level                  │
│ • Used multiple hooks (useBluetooth, useBluetoothPacketStream) │
│ • Hook calls required in child components                    │
│ • Manual subscription management with useEffect             │
│                                                               │
│ NEW:                                                          │
│ • Self-contained component                                   │
│ • Drop anywhere, works immediately                           │
│ • Single component with props                                │
│ • Render prop for custom UI                                  │
│ • Automatic subscription management                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
*/

// ============================================================================
// Migration Steps
// ============================================================================

/*
STEP 1: Remove Old Files
────────────────────────
Delete:
  • BleProvider.tsx
  • (Keep Esp32BleClient.ts for reference if needed)

STEP 2: Add New Module
──────────────────────
Copy the entire 'src' folder to your project


STEP 3: Update AndroidManifest.xml
───────────────────────────────────
(No changes needed if already done for old implementation)


STEP 4: Update App.tsx
──────────────────────
See examples below based on your use case.


STEP 5: Remove useBluetooth() and useBluetoothPacketStream()
─────────────────────────────────────────────────
Replace all component files that used these hooks.
*/

// ============================================================================
// Migration Examples
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────
// Example 1: Simple Conversion (Minimal UI)
// ─────────────────────────────────────────────────────────────────────────

// BEFORE (with useBluetooth)
/*
function OldApp() {
  const { connected } = useBluetooth();
  
  return (
    <View>
      <Text>Connected: {connected}</Text>
    </View>
  );
}
*/

// AFTER (with BluetoothESPConnection)
function NewApp() {
  return (
    <BluetoothESPConnection>
      {(status: BluetoothStatus, connected: boolean) => (
        <View>
          <Text>Connected: {connected}</Text>
        </View>
      )}
    </BluetoothESPConnection>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Example 2: With Packet Handler
// ─────────────────────────────────────────────────────────────────────────

// BEFORE
/*
function OldComponent() {
  const handlePacket = useCallback((packet: SensorPacket) => {
    console.log(packet);
  }, []);
  
  useBluetoothPacketStream(handlePacket);
  
  return <View />;
}
*/

// AFTER
function NewComponent() {
  const handlePacket = useCallback((packet: SensorPacket) => {
    console.log(packet);
  }, []);

  return <BluetoothESPConnection onPacket={handlePacket} />;
}

// ─────────────────────────────────────────────────────────────────────────
// Example 3: With Status and Manual Controls
// ─────────────────────────────────────────────────────────────────────────

// BEFORE
/*
function OldControls() {
  const { status, connected, connect, disconnect } = useBluetooth();
  
  return (
    <View>
      <Text>Status: {status}</Text>
      {!connected && <Button title="Connect" onPress={connect} />}
      {connected && <Button title="Disconnect" onPress={disconnect} />}
    </View>
  );
}
*/

// AFTER
function NewControls() {
  return (
    <BluetoothESPConnection>
      {(
        status: BluetoothStatus,
        connected: boolean,
        { connect, disconnect }: { connect: () => Promise<void>; disconnect: () => Promise<void> },
      ) => (
        <View>
          <Text>Status: {status}</Text>
          {!connected && <Button title="Connect" onPress={connect} />}
          {connected && <Button title="Disconnect" onPress={disconnect} />}
        </View>
      )}
    </BluetoothESPConnection>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Example 4: Sensor-Specific Processing
// ─────────────────────────────────────────────────────────────────────────

// BEFORE
/*
function OldSensorApp() {
  const handlePacket = useCallback((packet) => {
    if (packet.sensor === 'EMG') {
      // Handle EMG
    } else if (packet.sensor === 'IMU') {
      // Handle IMU
    }
  }, []);
  
  useBluetoothPacketStream(handlePacket);
  
  return <View />;
}
*/

// AFTER
import { useEMGPackets, useIMUPackets } from './src';

function NewSensorApp() {
  const handleEMGPacket = useCallback((values: number[], timestamp: number) => {
    console.log('EMG:', values);
  }, []);

  const handleIMUPacket = useCallback((values: number[], timestamp: number) => {
    console.log('IMU:', values);
  }, []);

  const emgHandler = useEMGPackets(handleEMGPacket);
  const imuHandler = useIMUPackets(handleIMUPacket);

  const handlePacket = useCallback(
    (packet: SensorPacket) => {
      emgHandler(packet);
      imuHandler(packet);
    },
    [emgHandler, imuHandler]
  );

  return <BluetoothESPConnection onPacket={handlePacket} />;
}

// ============================================================================
// Backward Compatibility
// ============================================================================

/*
If you want to gradually migrate and need backward compatibility,
you can create a wrapper hook:

import { useCallback, useEffect, useRef } from 'react';
import BluetoothESPConnection, { SensorPacket } from './src';

function LegacyBleProvider({ children }) {
  const packetListenersRef = useRef(new Set());
  
  const handlePacket = useCallback((packet) => {
    for (const listener of packetListenersRef.current) {
      listener(packet);
    }
  }, []);
  
  return (
    <BluetoothESPConnection onPacket={handlePacket}>
      {children}
    </BluetoothESPConnection>
  );
}

// Then wrap your app as before:
// <LegacyBluetoothProvider>
//   <YourApp />
// </LegacyBluetoothProvider>
*/

// ============================================================================
// Troubleshooting Migration Issues
// ============================================================================

/*
Problem: "Component not found after removing old provider"
─────────────────────────────────────────────────────────
Solution: 
  1. Make sure you removed the old BluetoothProvider wrapper
  2. Update imports to use new BluetoothESPConnection
  3. Check that render props are being used correctly
  4. Verify src/ folder is in correct location

Problem: "Hooks from old library not found"
────────────────────────────────────────────
Solution:
  1. Update useBluetooth() → use render prop
  2. Update useBluetoothPacketStream() → use onPacket prop
  3. Use new hooks like useEMGPackets() if needed

Problem: "Typescript errors after migration"
─────────────────────────────────────────────
Solution:
  1. Update import paths to './src'
  2. Ensure types are imported from correct module
  3. Check that BluetoothStatus is being used correctly
  4. Verify SensorPacket type is imported

Problem: "Data not being received"
──────────────────────────────────
Solution:
  1. Verify AndroidManifest.xml permissions
  2. Check that onPacket callback is being called
  3. Ensure component is mounted at app root
  4. Check Bluetooth connection status

Problem: "Multiple components re-subscribing on render"
────────────────────────────────────────────────────────
Solution:
  1. The new component handles subscriptions internally
  2. Don't need useEffect for subscriptions
  3. Callbacks are memoized automatically
  4. Use useCallback() for your handlers to optimize
*/

// ============================================================================
// Summary
// ============================================================================

/*
The new BluetoothESPConnection component:

✅ ADVANTAGES:
   • Zero configuration needed
   • No context providers required
   • Simpler mental model
   • Easier to test
   • Less boilerplate
   • Automatic lifecycle management
   • Drop-in component

❌ TRADE-OFFS:
   • Can't share connection across multiple root components
   • Must pass callbacks instead of consuming hooks

MIGRATION EFFORT:
   • Small apps: 5-15 minutes
   • Medium apps: 15-30 minutes  
   • Large apps: 30-60 minutes
   
   Mostly search-and-replace of imports and hook calls
*/