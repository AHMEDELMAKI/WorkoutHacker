declare module 'react-native-wifi-reborn' {
  type WifiManagerApi = {
    connectToProtectedSSID: (
      ssid: string,
      password: string,
      isWep?: boolean,
      isHidden?: boolean,
    ) => Promise<void>;
  };

  const WifiManager: WifiManagerApi;
  export default WifiManager;
}
