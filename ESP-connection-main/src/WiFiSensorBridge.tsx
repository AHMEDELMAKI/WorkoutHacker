/**
 * WiFi Sensor Bridge Component
 * 
 * A lightweight React component that manages the WiFi sensor connection lifecycle.
 * 
 * Usage:
 * ```tsx
 * // Wrap your app with this component
 * <WiFiSensorBridge
 *   baseUrl="http://192.168.4.1"
 *   espSsid="ESP32-Sensors"
 *   espPassword="sensors123"
 *   autoConnect
 * >
 *   <AppNavigator />
 * </WiFiSensorBridge>
 * 
 * // In any component, use the global service to subscribe to data
 * const MyComponent = () => {
 *   useEffect(() => {
 *     const unsubscribe = WiFiSensorService.subscribeSensorData((packet) => {
 *       console.log('Got packet:', packet);
 *     });
 *     return unsubscribe;
 *   }, []);
 *   
 *   return <Text>Listening to sensor data globally</Text>;
 * };
 * ```
 */

import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WiFiSensorService, WiFiSensorStatus } from './services/WiFiSensorService';
import { connectToEspWifi } from './services/wifiConnection';

export interface WiFiSensorBridgeProps {
  children?: React.ReactNode;
  /** HTTP base URL exposed by the ESP32 AP server. Default http://192.168.4.1 */
  baseUrl?: string;
  /** WiFi SSID for the ESP32 access point. Default ESP32-Sensors */
  espSsid?: string;
  /** WiFi password for the ESP32 access point. Default sensors123 */
  espPassword?: string;
  /** Try to join the ESP32 WiFi network automatically on mount. Default true */
  autoConnect?: boolean;
  /** Poll interval in milliseconds. Default 50 */
  pollIntervalMs?: number;
  /** Called when connection status changes */
  onStatusChange?: (status: WiFiSensorStatus) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * WiFiSensorBridge - Manages global WiFi sensor connection
 * 
 * This component should be placed high in your app tree (e.g., wrapping the root navigator).
 * It manages the lifecycle of WiFi polling and makes data available globally via WiFiSensorService.
 */
export const WiFiSensorBridge: React.FC<WiFiSensorBridgeProps> = ({
  children,
  baseUrl = 'http://192.168.4.1',
  espSsid = 'ESP32-Sensors',
  espPassword = 'sensors123',
  autoConnect = true,
  pollIntervalMs = 50,
  onStatusChange,
  onError,
}) => {
  const statusUnsubscribeRef = useRef<(() => void) | null>(null);
  const errorUnsubscribeRef = useRef<(() => void) | null>(null);
  const statusHandlerRef = useRef(onStatusChange);
  const errorHandlerRef = useRef(onError);

  useEffect(() => {
    statusHandlerRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    errorHandlerRef.current = onError;
  }, [onError]);

  useEffect(() => {
    // Configure service for current props.
    WiFiSensorService.configure({ baseUrl, pollIntervalMs });

    const connect = async () => {
      if (!autoConnect) {
        return;
      }

      try {
        await connectToEspWifi({ ssid: espSsid, password: espPassword });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errorHandlerRef.current?.(err);
      }
    };

    void connect();

    // Start the service.
    if (!WiFiSensorService.isRunning()) {
      WiFiSensorService.start();
    }

    // Cleanup on unmount/config change.
    return () => {
      WiFiSensorService.stop();
    };
  }, [autoConnect, baseUrl, espPassword, espSsid, pollIntervalMs]);

  useEffect(() => {
    statusUnsubscribeRef.current?.();
    statusUnsubscribeRef.current = WiFiSensorService.subscribeStatus((status) => {
      statusHandlerRef.current?.(status);
    });

    return () => {
      statusUnsubscribeRef.current?.();
      statusUnsubscribeRef.current = null;
    };
  }, []);

  useEffect(() => {
    errorUnsubscribeRef.current?.();
    errorUnsubscribeRef.current = WiFiSensorService.subscribeError((error) => {
      errorHandlerRef.current?.(error);
    });

    return () => {
      errorUnsubscribeRef.current?.();
      errorUnsubscribeRef.current = null;
    };
  }, []);

  // This component doesn't render anything by itself, just manages lifecycle
  if (children) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return null;
};

export default WiFiSensorBridge;
