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
   * Start polling for sensor data
   */
  start(): void {
    if (this.pollTimer !== null) {
      console.warn('WiFi sensor service already started');
      return;
    }

    this.isMounted = true;
    this.setStatus('connecting');

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
        console.debug('[WiFiSensorService] polling', this.baseUrl + '/data');
        const response = await fetch(`${this.baseUrl}/data`);
        console.debug('[WiFiSensorService] fetch response ok?', response.ok, 'status', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        console.debug('[WiFiSensorService] fetched text length', text.length);
        if (text.trim()) {
          if (!this.hasConnectedOnce) {
            this.hasConnectedOnce = true;
            this.setStatus('connected');
          }
        }

        const lines = text.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          const packet = parseSensorLine(trimmed);
          if (packet) {
            console.debug('[WiFiSensorService] parsed packet', packet.sensor, packet.timestamp);
            this.notifySensorData(packet);
          }
        }
      } catch (error) {
        if (!this.isMounted) {
          return;
        }

        this.setStatus('connecting');
        const err = error instanceof Error ? error : new Error(String(error));
        console.warn('[WiFiSensorService] poll error', err);
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
   * Internal: Notify all subscribers of new sensor data
   */
  private notifySensorData(packet: SensorPacket): void {
    this.sensorDataSubscribers.forEach((callback) => {
      try {
        callback(packet);
      } catch (error) {
        console.error('Error in sensor data subscriber:', error);
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
      } catch (error) {
        console.error('Error in status subscriber:', error);
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
      } catch (error) {
        console.error('Error in error subscriber:', error);
      }
    });
  }
}

// Export singleton instance
export const WiFiSensorService = WiFiSensorServiceImpl.getInstance();
