/**
 * WiFi Sensor Hooks
 * 
 * Convenient React hooks for accessing global WiFi sensor data.
 * These hooks work with the global WiFiSensorService, so components
 * can subscribe to sensor data anywhere without needing the bridge
 * in their component tree.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { WiFiSensorService, WiFiSensorStatus } from './services/WiFiSensorService';
import { SensorPacket, isEMGPacket, isIMUPacket } from './utils/packetParser';

/**
 * Hook to get current WiFi sensor connection status
 * 
 * Usage:
 * ```tsx
 * const status = useWiFiSensorStatus();
 * <Text>{status}</Text>
 * ```
 */
export function useWiFiSensorStatus(): WiFiSensorStatus {
  const [status, setStatus] = useState<WiFiSensorStatus>(() => WiFiSensorService.getStatus());

  useEffect(() => {
    console.debug('[useWiFiSensorStatus] subscribing to status');
    const unsubscribe = WiFiSensorService.subscribeStatus(setStatus);
    return unsubscribe;
  }, []);

  return status;
}

/**
 * Hook to subscribe to all sensor packets globally
 * 
 * Usage:
 * ```tsx
 * const handlePacket = useCallback((packet: SensorPacket) => {
 *   console.log('Packet:', packet);
 * }, []);
 * 
 * useSensorPackets(handlePacket);
 * ```
 */
export function useSensorPackets(
  onPacket: (packet: SensorPacket) => void
): void {
  const callbackRef = useRef(onPacket);

  useEffect(() => {
    callbackRef.current = onPacket;
  }, [onPacket]);

  useEffect(() => {
    console.debug('[useSensorPackets] subscribing to sensor data');
    const unsubscribe = WiFiSensorService.subscribeSensorData((packet) => {
      callbackRef.current(packet);
    });
    return unsubscribe;
  }, []);
}

/**
 * Hook for filtering and processing EMG packets specifically
 * 
 * Usage:
 * ```tsx
 * const handleEMGPacket = useCallback((packet) => {
 *   console.log('EMG:', packet);
 * }, []);
 * 
 * useEMGPackets(handleEMGPacket);
 * ```
 */
export function useEMGPackets(
  onEMGPacket: (packet: Exclude<SensorPacket, { sensor: 'IMU' }>) => void
): void {
  const callbackRef = useRef(onEMGPacket);

  useEffect(() => {
    callbackRef.current = onEMGPacket;
  }, [onEMGPacket]);

  useEffect(() => {
    console.debug('[useEMGPackets] subscribing to EMG packets');
    const unsubscribe = WiFiSensorService.subscribeSensorData((packet) => {
      if (isEMGPacket(packet)) {
        callbackRef.current(packet);
      }
    });
    return unsubscribe;
  }, []);
}

/**
 * Hook for filtering and processing IMU packets specifically
 * 
 * Usage:
 * ```tsx
 * const handleIMUPacket = useCallback((packet) => {
 *   console.log('IMU:', packet);
 * }, []);
 * 
 * useIMUPackets(handleIMUPacket);
 * ```
 */
export function useIMUPackets(
  onIMUPacket: (packet: Exclude<SensorPacket, { sensor: 'EMG' }>) => void
): void {
  const callbackRef = useRef(onIMUPacket);

  useEffect(() => {
    callbackRef.current = onIMUPacket;
  }, [onIMUPacket]);

  useEffect(() => {
    console.debug('[useIMUPackets] subscribing to IMU packets');
    const unsubscribe = WiFiSensorService.subscribeSensorData((packet) => {
      if (isIMUPacket(packet)) {
        callbackRef.current(packet);
      }
    });
    return unsubscribe;
  }, []);
}

/**
 * Hook to get WiFi sensor connection status with error information
 * 
 * Usage:
 * ```tsx
 * const { status, error } = useWiFiSensorState();
 * ```
 */
export function useWiFiSensorState(): {
  status: WiFiSensorStatus;
  error: Error | null;
} {
  const [status, setStatus] = useState<WiFiSensorStatus>(() => WiFiSensorService.getStatus());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribeStatus = WiFiSensorService.subscribeStatus(setStatus);
    const unsubscribeError = WiFiSensorService.subscribeError((err) => {
      setError(err);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeError();
    };
  }, []);

  return { status, error };
}

/**
 * Hook to diagnose ESP32 connection issues
 * 
 * Usage:
 * ```tsx
 * const { run, loading, result } = useDiagnostics();
 * 
 * <Button onPress={() => run()}>
 *   {loading ? 'Testing...' : 'Test Connection'}
 * </Button>
 * 
 * {result && (
 *   <Text>
 *     Root URL: {result.rootUrl ? '✓' : '✗'}
 *     Data Endpoint: {result.dataEndpoint ? '✓' : '✗'}
 *     Errors: {result.errors.join(', ')}
 *   </Text>
 * )}
 * ```
 */
export interface DiagnosticResult {
  rootUrl: boolean;
  dataEndpoint: boolean;
  errors: string[];
}

export function useDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const diag = await WiFiSensorService.diagnoseConnection();
      setResult(diag);
      return diag;
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      setResult({
        rootUrl: false,
        dataEndpoint: false,
        errors: [err],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, result };
}