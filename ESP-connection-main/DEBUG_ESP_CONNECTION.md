# ESP32 Connection Debugging Guide

## Problem: "Network request failed" in React Native but works in Chrome

This happens because React Native has stricter network policies than browsers.

## Solution Checklist

### 1. **Network Security Config** ✓
Ensure `network_security_config.xml` allows cleartext HTTP on local IPs:

```xml
<domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">192.168.4.1</domain>
    <domain includeSubdomains="true">localhost</domain>
    <domain includeSubdomains="true">10.0.2.2</domain>
</domain-config>
```

### 2. **Data Format Support** ✓
The parser now supports:
- **EMG**: `timestamp,EMG,val1,val2,val3,val4`
- **IMU**: `timestamp,IMU,roll,pitch,yaw,ax,ay,az,gx,gy,gz,mx,my,mz`

### 3. **Enhanced Fetch Options** ✓
Added headers to match browser requests:
- `Cache-Control: no-cache`
- `User-Agent: WorkoutHacker/1.0`
- `credentials: omit` (for local network)

## Testing on Device

### Option A: Add Test Button to Your App
```tsx
import { useDiagnostics } from './ESP-connection-main/src';
import { Button, View, Text } from 'react-native';

function TestConnection() {
  const { run, loading, result } = useDiagnostics();
  
  return (
    <View>
      <Button 
        title={loading ? 'Testing...' : 'Test ESP Connection'} 
        onPress={run}
        disabled={loading}
      />
      {result && (
        <View>
          <Text>Root URL: {result.rootUrl ? '✓' : '✗'}</Text>
          <Text>Data Endpoint: {result.dataEndpoint ? '✓' : '✗'}</Text>
          {result.errors.map((err, i) => (
            <Text key={i} style={{color: 'red'}}>{err}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
```

### Option B: Check Console Logs
Look for:
- ✓ `[WiFiSensorService] Root URL: 200 ✓` → ESP32 is reachable
- ✓ `[WiFiSensorService] fetched text length: 500` → Data is being sent
- ✓ `[WiFiSensorService] parsed packet imu` → Data is being parsed

## If Still Failing

1. **Verify WiFi Connection:**
   - Settings → WiFi → Confirm you're on "ESP32-Sensors"
   - Try accessing http://192.168.4.1 in mobile Chrome again

2. **Check ESP32 Status:**
   - ESP32 powered on?
   - Sensors connected?
   - HTTP server running?

3. **Try Different Approach:**
   - Use IP directly instead of hostname
   - Try accessing at different intervals
   - Check if ESP32 WiFi range is stable

4. **Rebuild App:**
   ```bash
   npm run android
   ```

## Data Structure

After parsing, packets have:

**EMG Packet:**
```ts
{
  sensor: 'emg',
  timestamp: 2776548,
  rawSignal: 0.00,
  rawValues: [0.00, 0.00, 0.00, 0]
}
```

**IMU Packet:**
```ts
{
  sensor: 'imu',
  timestamp: 2776593,
  roll: -15.33,
  pitch: -26.85,
  yaw: 236.13,
  ax: 0.21,      // accelerometer x
  ay: -0.11,
  az: 0.41,
  gx: -0.32,     // gyroscope x
  gy: 0.25,
  gz: 0.01,
  mx: 29.05,     // magnetometer x
  my: -149.36,
  mz: -356.06
}
```

## Recent Changes

- ✓ Added `Cache-Control` and `User-Agent` headers
- ✓ Added `credentials: omit` for local network
- ✓ Updated packet parser to handle 13-value IMU format
- ✓ Added diagnostic method to test connectivity
- ✓ Better error messages for debugging
