/**
 * Global WiFi Sensor Service
 * 
 * A singleton service that manages WiFi sensor data reception and distribution.
 * Any model or component can subscribe to sensor data globally without 
 * needing the WiFiSensorBridge component in their component tree.
 * 
 * Features:
 * - Global sensor data streaming
 * - Multiple subscribers support
 * - Automatic connection status management
 * - EMG and IMU packet parsing
 */

import { SensorPacket, parseSensorLine } from '../utils/packetParser';

export type WiFiSensorStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

export type SensorDataSubscriber = (packet: SensorPacket) => void;
export type StatusSubscriber = (status: WiFiSensorStatus) => void;
export type ErrorSubscriber = (error: Error) => void;

class WiFiSensorServiceImpl {
  private static instance: WiFiSensorServiceImpl;
  
  private status: WiFiSensorStatus = 'idle';
  private baseUrl: string = 'http://192.168.4.1';
  private pollIntervalMs: number = 50;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollInFlight: boolean = false;
  private isMounted: boolean = false;
  private hasConnectedOnce: boolean = false;
  
  // Subscribers
  private sensorDataSubscribers: Set<SensorDataSubscriber> = new Set();
  private statusSubscribers: Set<StatusSubscriber> = new Set();
  private errorSubscribers: Set<ErrorSubscriber> = new Set();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): WiFiSensorServiceImpl {
    if (!WiFiSensorServiceImpl.instance) {
      WiFiSensorServiceImpl.instance = new WiFiSensorServiceImpl();
    }
    return WiFiSensorServiceImpl.instance;
  }

  /**
   * Initialize the service with configuration
   */
  configure(options: {
    baseUrl?: string;
    pollIntervalMs?: number;
  } = {}): void {
    this.baseUrl = options.baseUrl ?? 'http://192.168.4.1';
    this.pollIntervalMs = options.pollIntervalMs ?? 50;
  }

  /**
   * Test if ESP32 is reachable at baseUrl
   */
  private async testConnection(): Promise<boolean> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      console.debug('[WiFiSensorService] Testing connection to', this.baseUrl);
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Try root endpoint first
      const response = await fetch(this.baseUrl, { signal: controller.signal });
      if (timeoutId) clearTimeout(timeoutId);
      
      console.debug('[WiFiSensorService] Root path response:', response.status);
      return response.ok || response.status < 500;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn('[WiFiSensorService] Connection test failed:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Start polling for sensor data
   */
  start(): void {
    if (this.pollTimer !== null) {
      console.warn('WiFi sensor service already started');
      return;
    }

    this.isMounted = true;
    this.setStatus('connecting');
    
    // First test if ESP32 is reachable
    this.testConnection().then((isReachable) => {
      if (!isReachable) {
        console.error('[WiFiSensorService] ESP32 is not reachable at', this.baseUrl);
        this.notifyError(new Error(`ESP32 not reachable at ${this.baseUrl}. Check WiFi connection.`));
      } else {
        console.debug('[WiFiSensorService] ESP32 is reachable');
      }
    });

    const poll = async () => {
      if (!this.isMounted) {
        return;
      }

      // Avoid piling up requests when the network/ESP32 response is slower than poll interval.
      if (this.pollInFlight) {
        return;
      }

      this.pollInFlight = true;

      try {
        const url = `${this.baseUrl}/data`;
        console.debug('[WiFiSensorService] polling', url);
        
        // Add 5-second timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Accept': 'text/plain',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'User-Agent': 'WorkoutHacker/1.0',
          },
          method: 'GET',
          credentials: 'omit',
        });
        clearTimeout(timeoutId);
        
        console.debug('[WiFiSensorService] fetch response ok?', response.ok, 'status', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        console.debug('[WiFiSensorService] fetched text length', text.length, 'content:', text.substring(0, 100));
        
        if (text.trim().length === 0) {
          console.warn('[WiFiSensorService] WARNING: Got empty response from ESP32. Check if sensors are connected/running.');
          if (!this.hasConnectedOnce) {
            // Still mark as connected if we got a successful HTTP response, even if no data yet
            this.hasConnectedOnce = true;
            this.setStatus('connected');
          }
          return;
        }
        
        if (!this.hasConnectedOnce) {
          this.hasConnectedOnce = true;
          this.setStatus('connected');
        }

        const lines = text.split(/\r?\n/);
        let parsedCount = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          const packet = parseSensorLine(trimmed);
          if (packet) {
            console.debug('[WiFiSensorService] parsed packet', packet.sensor, packet.timestamp);
            this.notifySensorData(packet);
            parsedCount++;
          }
        }
        
        if (parsedCount === 0 && lines.length > 0) {
          console.warn('[WiFiSensorService] WARNING: Got response but failed to parse packets. Response:', text.substring(0, 200));
        }
      } catch (error) {
        if (!this.isMounted) {
          return;
        }

        this.setStatus('connecting');
        
        let errMsg = 'Unknown error';
        if (error instanceof Error) {
          errMsg = error.message;
          // React Native specific error messages
          if (errMsg.includes('Failed to fetch') || errMsg.includes('Network request failed')) {
            errMsg = `Cannot reach ESP32 at ${this.baseUrl}. Make sure:\n1. Phone is connected to ESP32 WiFi\n2. ESP32 is powered on and HTTP server is running\n3. IP address is correct`;
          } else if (errMsg === 'The operation was aborted' || errMsg.includes('Abort')) {
            errMsg = `Request timeout (5s) - ESP32 not responding at ${this.baseUrl}`;
          } else if (errMsg.includes('ECONNREFUSED') || errMsg.includes('unreachable')) {
            errMsg = `Connection refused - ESP32 is not accepting connections on ${this.baseUrl}`;
          }
        }
        
        const err = new Error(errMsg);
        console.warn('[WiFiSensorService] poll error:', err.message);
        this.notifyError(err);
      } finally {
        this.pollInFlight = false;
      }
    };

    this.pollTimer = setInterval(() => {
      void poll();
    }, this.pollIntervalMs);

    // Initial poll
    void poll();
  }

  /**
   * Stop polling for sensor data
   */
  stop(): void {
    this.isMounted = false;
    this.pollInFlight = false;
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.hasConnectedOnce = false;
    this.setStatus('disconnected');
  }

  /**
   * Subscribe to sensor data packets
   */
  subscribeSensorData(callback: SensorDataSubscriber): () => void {
    this.sensorDataSubscribers.add(callback);
    return () => {
      this.sensorDataSubscribers.delete(callback);
    };
  }

  /**
   * Subscribe to status changes
   */
  subscribeStatus(callback: StatusSubscriber): () => void {
    this.statusSubscribers.add(callback);
    // Immediately notify of current status
    callback(this.status);
    return () => {
      this.statusSubscribers.delete(callback);
    };
  }

  /**
   * Subscribe to errors
   */
  subscribeError(callback: ErrorSubscriber): () => void {
    this.errorSubscribers.add(callback);
    return () => {
      this.errorSubscribers.delete(callback);
    };
  }

  /**
   * Get current connection status
   */
  getStatus(): WiFiSensorStatus {
    return this.status;
  }

  /**
   * Get whether service is actively polling
   */
  isRunning(): boolean {
    return this.pollTimer !== null;
  }

  /**
   * Diagnostic: Check if ESP32 endpoints are working
   * Call this to debug connection issues
   */
  async diagnoseConnection(): Promise<{
    rootUrl: boolean;
    dataEndpoint: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    console.log('[WiFiSensorService] Starting diagnostics...');
    
    // Test root
    let rootUrl = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(this.baseUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      rootUrl = response.ok || response.status < 500;
      console.log('[WiFiSensorService] Root URL:', response.status, rootUrl ? '✓' : '✗');
    } catch (error) {
      errors.push(`Root URL unreachable: ${error instanceof Error ? error.message : String(error)}`);
      console.log('[WiFiSensorService] Root URL: ✗', errors[errors.length - 1]);
    }
    
    // Test /data endpoint
    let dataEndpoint = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${this.baseUrl}/data`, { signal: controller.signal });
      clearTimeout(timeoutId);
      dataEndpoint = response.ok || response.status < 500;
      const content = await response.text();
      console.log('[WiFiSensorService] /data endpoint:', response.status, dataEndpoint ? '✓' : '✗', 'content length:', content.length);
    } catch (error) {
      errors.push(`/data endpoint unreachable: ${error instanceof Error ? error.message : String(error)}`);
      console.log('[WiFiSensorService] /data endpoint: ✗', errors[errors.length - 1]);
    }
    
    const result = { rootUrl, dataEndpoint, errors };
    console.log('[WiFiSensorService] Diagnostics result:', result);
    return result;
  }

  /**
   * Internal: Notify all subscribers of sensor data
   */
  private notifySensorData(packet: SensorPacket): void {
    this.sensorDataSubscribers.forEach((callback) => {
      try {
        callback(packet);
      } catch (callbackError) {
        console.error('Error in sensor data subscriber:', callbackError);
      }
    });
  }

  /**
   * Internal: Notify all subscribers of status change
   */
  private setStatus(newStatus: WiFiSensorStatus): void {
    if (this.status === newStatus) {
      return;
    }
    this.status = newStatus;
    this.statusSubscribers.forEach((callback) => {
      try {
        callback(newStatus);
      } catch (callbackError) {
        console.error('Error in status subscriber:', callbackError);
      }
    });
  }

  /**
   * Internal: Notify all subscribers of errors
   */
  private notifyError(error: Error): void {
    this.errorSubscribers.forEach((callback) => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error subscriber:', callbackError);
      }
    });
  }
}

// Export singleton instance
export const WiFiSensorService = WiFiSensorServiceImpl.getInstance();