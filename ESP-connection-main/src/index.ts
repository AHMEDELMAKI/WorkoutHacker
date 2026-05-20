// Main component export
export { WiFiSensorBridge } from './WiFiSensorBridge';
export type {
  WiFiSensorBridgeProps,
} from './WiFiSensorBridge';

// Service exports
export { WiFiSensorService } from './services/WiFiSensorService';
export type {
  WiFiSensorStatus,
  SensorDataSubscriber,
  StatusSubscriber,
  ErrorSubscriber,
} from './services/WiFiSensorService';

// Type exports
export type { SensorPacket } from './utils/packetParser';

// Utility function exports
export {
  parseSensorLine,
  isEMGPacket,
  isIMUPacket,
  extractEMGValues,
  extractIMUValues,
} from './utils/packetParser';

// Hook exports
export {
  useWiFiSensorStatus,
  useSensorPackets,
  useEMGPackets,
  useIMUPackets,
  useWiFiSensorState,
} from './hooks';

// Re-export main component as default
export { default } from './WiFiSensorBridge';