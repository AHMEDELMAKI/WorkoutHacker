import React from 'react';
import { StatusBar, useColorScheme, SafeAreaView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalVoiceController from './src/components/GlobalVoiceController';
import { useAuthStore } from './src/store/authStore';
import { WiFiSensorBridge } from './ESP-connection-main/src';
import { WiFiSensorService } from './ESP-connection-main/src';

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.children;
    }

    return this.props.children;
  }
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const initAuth = useAuthStore(s => s.initialize);
  const [globalError, setGlobalError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    initAuth();
  }, []);

  React.useEffect(() => {
    // Install global JS error handler to surface crashes in the UI and logs
    const globalAny: any = global as any;
    const prevHandler = globalAny.ErrorUtils && globalAny.ErrorUtils.getGlobalHandler && globalAny.ErrorUtils.getGlobalHandler();
    try {
      if (globalAny.ErrorUtils && globalAny.ErrorUtils.setGlobalHandler) {
        globalAny.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
          console.error('[Global ErrorHandler] uncaught', error, isFatal);
          setGlobalError(error instanceof Error ? error : new Error(String(error)));
          if (typeof prevHandler === 'function') {
            try { prevHandler(error, isFatal); } catch (e) { /* ignore */ }
          }
        });
      }

      // Unhandled promise rejections
      (globalThis as any).onunhandledrejection = (ev: any) => {
        console.error('[Global] unhandledrejection', ev);
        const reason = ev?.reason ?? ev;
        setGlobalError(reason instanceof Error ? reason : new Error(String(reason)));
      };
    } catch (e) {
      console.error('Failed to set global error handlers', e);
    }

    return () => {
      try {
        if (globalAny.ErrorUtils && globalAny.ErrorUtils.setGlobalHandler && prevHandler) {
          globalAny.ErrorUtils.setGlobalHandler(prevHandler);
        }
        (globalThis as any).onunhandledrejection = undefined;
      } catch (e) { }
    };
  }, []);

  const content = (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <AppNavigator />
    </>
  );

  /*
  // If a global JS error occurred, show an explicit error screen so we can capture details
  if (globalError) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>Unhandled JS Error</Text>
        <Text style={{ color: 'white', marginTop: 10 }}>{globalError.message}</Text>
      </SafeAreaView>
    );
  }
  */

  React.useEffect(() => {
    const unsubscribeData = WiFiSensorService.subscribeSensorData((packet) => {
      console.log('📡 SENSOR DATA RECEIVED:', packet);
    });

    const unsubscribeStatus = WiFiSensorService.subscribeStatus((status) => {
      console.log('🔄 WiFi Sensor Status:', status);
    });

    const unsubscribeError = WiFiSensorService.subscribeError((error) => {
      console.error('❌ WiFi Sensor Error:', error.message);
    });

    return () => {
      unsubscribeData();
      unsubscribeStatus();
      unsubscribeError();
    };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView>
        <View style={{ flex: 1 }}>
          <SafeAreaProvider>
            <WiFiSensorBridge>
              {content}
            </WiFiSensorBridge>
          </SafeAreaProvider>
        </View>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;
