import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FatigueCheckStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../../workout/components/PrimaryWorkoutButton';
import { useFatigueCheck } from '../context/FatigueCheckContext';

type Props = NativeStackScreenProps<FatigueCheckStackParamList, 'FatigueProcessing'>;

function getConnectionLabel(status: string): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting';
    case 'scanning':
      return 'Scanning';
    case 'error':
      return 'Error';
    default:
      return 'Starting';
  }
}

const FatigueProcessingScreen: React.FC<Props> = ({ navigation }) => {
  const [WiFiSensorBridge, setWiFiSensorBridge] = React.useState<React.ComponentType<any> | null>(null);
  const [CoreWiFiBridge, setCoreWiFiBridge] = React.useState<React.ComponentType<any> | null>(null);
  const {
    capturedHeartRate,
    bluetoothStatus,
    sensorError,
    emgSample,
    emgReadingCount,
    requiredEmgReadings,
    velocityReading,
    velocityRepCount,
    requiredVelocityReps,
    velocityReady,
    liveVelocity,
    processingElapsedSec,
    result,
    resetSession,
    startSensorProcessing,
    handleBluetoothStatusChange,
    handleSensorError,
    handleEMGReading,
    handleIMUReading,
  } = useFatigueCheck();
  const movedForwardRef = useRef(false);

  useEffect(() => {
    startSensorProcessing();
  }, [startSensorProcessing]);

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      import('../../../../Fatigue-with-HeartRate-main/src/react-native/WiFiSensorBridge'),
      import('../../../../ESP-connection-main/src'),
    ])
      .then(([fatigueModule, coreModule]) => {
        if (!mounted) return;
        setWiFiSensorBridge(() => fatigueModule.WiFiSensorBridge ?? fatigueModule.default ?? null);
        setCoreWiFiBridge(() => coreModule.WiFiSensorBridge ?? coreModule.default ?? null);
      })
      .catch((error) => {
        console.error('Failed to load sensor bridge modules for fatigue processing', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!result) {
        resetSession();
      }
    });

    return unsubscribe;
  }, [navigation, resetSession, result]);

  useEffect(() => {
    if (!result || movedForwardRef.current) return;

    movedForwardRef.current = true;
    navigation.replace('FatigueResults');
  }, [navigation, result]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.background} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {CoreWiFiBridge ? (
            <CoreWiFiBridge baseUrl="http://192.168.4.1" pollIntervalMs={50}>
              {WiFiSensorBridge ? (
                <WiFiSensorBridge
                  onEMGReading={handleEMGReading}
                  onIMUReading={handleIMUReading}
                  onStatusChange={handleBluetoothStatusChange}
                  onError={handleSensorError}
                />
              ) : (
                <View style={styles.loadingBridgeCard}>
                  <Text style={styles.loadingBridgeText}>Loading sensor bridge...</Text>
                </View>
              )}
            </CoreWiFiBridge>
          ) : WiFiSensorBridge ? (
            // If core bridge failed but fatigue bridge exists, still render it (no polling)
            <WiFiSensorBridge
              onEMGReading={handleEMGReading}
              onIMUReading={handleIMUReading}
              onStatusChange={handleBluetoothStatusChange}
              onError={handleSensorError}
            />
          ) : (
            <View style={styles.loadingBridgeCard}>
              <Text style={styles.loadingBridgeText}>Loading sensor bridge...</Text>
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>Processing Sensor Data</Text>
            <Text style={styles.subtitle}>
              Heart rate is locked. We are now receiving EMG and IMU data to calculate muscle fatigue
              and movement velocity. This step usually takes about 10 to 18 seconds.
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Locked heart rate</Text>
            <Text style={styles.summaryValue}>
              {capturedHeartRate ? `${capturedHeartRate.bpm} bpm` : '--'}
            </Text>
            <Text style={styles.summarySubtext}>
              WiFi sensor: {getConnectionLabel(bluetoothStatus)}
            </Text>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>EMG</Text>
              <Text style={styles.metricValue}>
                {emgSample ? `${emgSample.rmsAmplitude.toFixed(1)} uV` : 'Waiting'}
              </Text>
              <Text style={styles.metricSubtext}>
                {emgSample
                  ? `${Math.round(emgSample.fatigueScore * 100)}% fatigue score`
                  : 'Need muscle signal'}
              </Text>
              <Text style={styles.metricProgress}>
                Windows: {emgReadingCount}/{requiredEmgReadings}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Velocity</Text>
              <Text style={styles.metricValue}>
                {velocityReading
                  ? `${velocityReading.velocityMps.toFixed(2)} m/s`
                  : liveVelocity
                    ? `${liveVelocity.toFixed(2)} m/s`
                    : 'Waiting'}
              </Text>
              <Text style={styles.metricSubtext}>
                {velocityReady
                  ? `${velocityReading?.velocityLossPct.toFixed(1)}% loss after ${velocityReading?.repNumber} movements`
                  : 'Make 3 smooth movements for a stable velocity-loss reading'}
              </Text>
              <Text style={styles.metricProgress}>
                Movements: {velocityRepCount}/{requiredVelocityReps}
              </Text>
            </View>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>What to do now</Text>
            <Text style={styles.instructionsText}>1. Join the ESP32-Sensors WiFi network.</Text>
            <Text style={styles.instructionsText}>
              2. Make 3 smooth movements so velocity loss can be estimated.
            </Text>
            <Text style={styles.instructionsText}>
              3. Hold still for a moment while at least 2 EMG windows are captured.
            </Text>
            <Text style={styles.instructionsTimer}>Elapsed: {processingElapsedSec}s</Text>
            {sensorError ? <Text style={styles.errorText}>{sensorError}</Text> : null}
          </View>

          <View style={styles.footer}>
            <PrimaryWorkoutButton
              label="Cancel Check"
              variant="white"
              onPress={() => {
                resetSession();
                navigation.popToTop();
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WT.colors.background,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: WT.spacing.lg,
    paddingTop: WT.spacing.md,
    paddingBottom: WT.spacing.sm,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    marginHorizontal: WT.spacing.lg,
    marginTop: WT.spacing.md,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 6,
  },
  summaryLabel: {
    color: WT.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: WT.colors.textDark,
    fontSize: 30,
    fontWeight: '800',
  },
  summarySubtext: {
    color: WT.colors.textMuted,
    fontSize: 13,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: WT.spacing.sm,
    marginHorizontal: WT.spacing.lg,
    marginTop: WT.spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: WT.spacing.md,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 8,
  },
  metricTitle: {
    color: WT.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: WT.colors.textDark,
    fontSize: 22,
    fontWeight: '800',
  },
  metricSubtext: {
    color: WT.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  metricProgress: {
    color: WT.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  instructionsCard: {
    marginHorizontal: WT.spacing.lg,
    marginTop: WT.spacing.md,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 10,
  },
  instructionsTitle: {
    color: WT.colors.textDark,
    fontSize: 18,
    fontWeight: '800',
  },
  instructionsText: {
    color: WT.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  instructionsTimer: {
    color: WT.colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  errorText: {
    color: WT.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingBridgeCard: {
    marginHorizontal: WT.spacing.lg,
    marginTop: WT.spacing.md,
    padding: WT.spacing.md,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
  },
  loadingBridgeText: {
    color: WT.colors.textMuted,
    fontSize: 13,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: WT.spacing.lg,
    paddingVertical: WT.spacing.md,
  },
});

export default FatigueProcessingScreen;
