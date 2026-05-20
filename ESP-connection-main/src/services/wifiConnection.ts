import { PermissionsAndroid, Platform } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

export interface EspWifiCredentials {
  ssid: string;
  password: string;
}

async function requestAndroidLocationPermission(): Promise<boolean> {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'WiFi permission required',
      message: 'Location permission is required to connect to the ESP32 WiFi network.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function connectToEspWifi(credentials: EspWifiCredentials): Promise<void> {
  if (!credentials.ssid || !credentials.password) {
    throw new Error('ESP WiFi credentials are required');
  }

  if (Platform.OS === 'android') {
    const hasPermission = await requestAndroidLocationPermission();
    if (!hasPermission) {
      throw new Error('Android location permission was denied');
    }
  }

  await WifiManager.connectToProtectedSSID(credentials.ssid, credentials.password, false, false);
}
