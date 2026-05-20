import React, { useCallback, useEffect, useRef } from 'react';
import { useEMGPackets, useIMUPackets, useWiFiSensorStatus } from '../../../ESP-connection-main/src';
import { WiFiSensorService } from '../../../ESP-connection-main/src/services/WiFiSensorService';
import { EMGProcessor, EMGSample } from '../emg';

export interface IMUReading {
  timestamp: number;
  roll: number;
  pitch: number;
  yaw: number;
}

export interface WiFiSensorBridgeProps {
  onEMGReading?: (sample: EMGSample) => void;
  onIMUReading?: (reading: IMUReading) => void;
  onStatusChange?: (status: 'scanning' | 'connecting' | 'connected' | 'error') => void;
  onError?: (error: Error) => void;
  /** EMG processor config: sample rate in Hz (default 50) */
  emgSampleRateHz?: number;
  /** EMG epoch size in samples (how many samples form an analysis epoch). Default 10 */
  emgEpochSize?: number;
  /** Micro-batch size: how many incoming samples to group before pushing to processor. Default 1 */
  emgMicroBatchSize?: number;
}

export const WiFiSensorBridge: React.FC<WiFiSensorBridgeProps> = ({
  onEMGReading,
  onIMUReading,
  onStatusChange,
  onError,
  emgSampleRateHz = 50,
  emgEpochSize = 10,
  emgMicroBatchSize = 1,
}) => {
  const emgProcessorRef = useRef(new EMGProcessor({ sampleRateHz: emgSampleRateHz, epochSize: emgEpochSize }));
  const microBatchRef = useRef<number[]>([]);
  const prevStatusRef = useRef<'scanning' | 'connecting' | 'connected' | 'error' | undefined>();

  console.debug('[Fatigue WiFiSensorBridge] mounted, config:', { emgSampleRateHz, emgEpochSize, emgMicroBatchSize });

  // Subscribe to raw EMG packets from global service
  useEMGPackets(
    useCallback(
      (packet) => {
        console.debug('[Fatigue WiFiSensorBridge] EMG packet received', packet.timestamp, packet.rawSignal);
        microBatchRef.current.push(packet.rawSignal);
        if (microBatchRef.current.length >= emgMicroBatchSize) {
          const batch = microBatchRef.current.splice(0, emgMicroBatchSize);
          const sample = emgProcessorRef.current.push(batch);
          if (sample) {
            onEMGReading?.({ ...sample, timestamp: packet.timestamp });
          }
        }
      },
      [onEMGReading, emgMicroBatchSize]
    )
  );

  // Subscribe to raw IMU packets from global service
  useIMUPackets(
    useCallback(
      (packet) => {
        console.debug('[Fatigue WiFiSensorBridge] IMU packet received', packet.timestamp);
        onIMUReading?.({
          timestamp: packet.timestamp,
          roll: packet.roll,
          pitch: packet.pitch,
          yaw: packet.yaw,
        });
      },
      [onIMUReading]
    )
  );

  // Monitor WiFi connection status
  const wifiStatus = useWiFiSensorStatus();
  
  useEffect(() => {
    const mappedStatus = mapWiFiStatusToLocalStatus(wifiStatus);
    if (mappedStatus !== prevStatusRef.current) {
      prevStatusRef.current = mappedStatus;
      onStatusChange?.(mappedStatus);
    }
  }, [wifiStatus, onStatusChange]);

  useEffect(() => {
    if (!onError) {
      return;
    }

    return WiFiSensorService.subscribeError(onError);
  }, [onError]);

  return null;
};

/**
 * Map global WiFi status to local status values
 */
function mapWiFiStatusToLocalStatus(
  wifiStatus: 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'
): 'scanning' | 'connecting' | 'connected' | 'error' {
  switch (wifiStatus) {
    case 'connected':
      return 'connected';
    case 'error':
      return 'error';
    case 'idle':
    case 'disconnected':
      return 'scanning';
    case 'connecting':
    default:
      return 'connecting';
  }
}

export default WiFiSensorBridge;
