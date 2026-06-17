// Minimal sensor packet parser used by WiFiSensorService.
// Accepts lines like:
//  - "1610000000,IMU,0.1,0.2,0.3"
//  - "1610000000,EMG,123.4"
// Returns structured packets consumed by subscribers.

export type EMGPacket = {
  sensor: 'emg';
  timestamp: number;
  rawSignal: number;
  rawValues?: number[];
};

export type IMUPacket = {
  sensor: 'imu';
  timestamp: number;
  roll: number;
  pitch: number;
  yaw: number;
  // Additional IMU sensor data
  ax?: number;  // accelerometer x
  ay?: number;  // accelerometer y
  az?: number;  // accelerometer z
  gx?: number;  // gyroscope x
  gy?: number;  // gyroscope y
  gz?: number;  // gyroscope z
  mx?: number;  // magnetometer x
  my?: number;  // magnetometer y
  mz?: number;  // magnetometer z
};

export type SensorPacket = EMGPacket | IMUPacket;

export function isEMGPacket(p: SensorPacket): p is EMGPacket {
  return p.sensor === 'emg';
}

export function isIMUPacket(p: SensorPacket): p is IMUPacket {
  return p.sensor === 'imu';
}

export function extractEMGValues(lineParts: string[]): number[] {
  // Everything after the label is treated as numeric EMG values
  const nums: number[] = [];
  for (let i = 2; i < lineParts.length; i++) {
    const v = Number(lineParts[i]);
    if (!Number.isNaN(v)) nums.push(v);
  }
  return nums;
}

export function extractIMUValues(lineParts: string[]): number[] {
  const nums: number[] = [];
  // Extract all numeric values after the label (positions 2 onwards)
  for (let i = 2; i < lineParts.length; i++) {
    const v = Number(lineParts[i]);
    if (!Number.isNaN(v)) nums.push(v);
  }
  return nums;
}

export function parseSensorLine(line: string): SensorPacket | null {
  const parts = line.split(',').map((s) => s.trim());
  if (parts.length < 2) return null;

  const ts = Number(parts[0]);
  const label = parts[1].toLowerCase();

  if (!Number.isFinite(ts)) {
    // If timestamp missing, try using Date.now()
    // but require at least label
  }

  if (label === 'emg') {
    const values = extractEMGValues(parts);
    const raw = values.length > 0 ? values[0] : NaN;
    if (Number.isNaN(raw)) return null;
    return { sensor: 'emg', timestamp: Number.isFinite(ts) ? ts : Date.now(), rawSignal: raw, rawValues: values };
  }

  if (label === 'imu') {
    const values = extractIMUValues(parts);
    if (values.length >= 3) {
      const [roll, pitch, yaw] = values;
      const packet: IMUPacket = { 
        sensor: 'imu', 
        timestamp: Number.isFinite(ts) ? ts : Date.now(), 
        roll, 
        pitch, 
        yaw,
      };
      
      // Add optional accelerometer, gyroscope, magnetometer values if present
      if (values.length >= 6) {
        packet.ax = values[3];
        packet.ay = values[4];
        packet.az = values[5];
      }
      if (values.length >= 9) {
        packet.gx = values[6];
        packet.gy = values[7];
        packet.gz = values[8];
      }
      if (values.length >= 12) {
        packet.mx = values[9];
        packet.my = values[10];
        packet.mz = values[11];
      }
      
      return packet;
    }
    return null;
  }

  // Fallback heuristics: if there are 3 numeric values after timestamp, treat as IMU
  const trailingNums = parts.slice(1).map((p) => Number(p)).filter((n) => !Number.isNaN(n));
  if (trailingNums.length >= 3) {
    const [roll, pitch, yaw] = trailingNums.slice(0, 3);
    const packet: IMUPacket = { 
      sensor: 'imu', 
      timestamp: Number.isFinite(ts) ? ts : Date.now(), 
      roll, 
      pitch, 
      yaw,
    };
    
    // Add optional values if present
    if (trailingNums.length >= 6) {
      packet.ax = trailingNums[3];
      packet.ay = trailingNums[4];
      packet.az = trailingNums[5];
    }
    if (trailingNums.length >= 9) {
      packet.gx = trailingNums[6];
      packet.gy = trailingNums[7];
      packet.gz = trailingNums[8];
    }
    if (trailingNums.length >= 12) {
      packet.mx = trailingNums[9];
      packet.my = trailingNums[10];
      packet.mz = trailingNums[11];
    }
    
    return packet;
  }

  if (trailingNums.length >= 1) {
    return { sensor: 'emg', timestamp: Number.isFinite(ts) ? ts : Date.now(), rawSignal: trailingNums[0], rawValues: trailingNums };
  }

  return null;
}
