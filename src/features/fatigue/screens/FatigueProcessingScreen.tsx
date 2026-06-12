import Ionicons from 'react-native-vector-icons/Ionicons';
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

  const emgProgress = (emgReadingCount / requiredEmgReadings) * 100;
  const velocityProgress = (velocityRepCount / requiredVelocityReps) * 100;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <Text style={styles.headerTitle}>Analyzing Sensors</Text>
            <View style={styles.statusBadgeRow}>
              <View style={[styles.statusBadge, bluetoothStatus === 'connected' ? styles.statusBadgeActive : styles.statusBadgeNeutral]}>
                <Ionicons 
                    name={bluetoothStatus === 'connected' ? "wifi" : "wifi-outline"} 
                    size={10} 
                    color={WT.colors.textLight} 
                />
                <Text style={styles.statusBadgeText}>
                    WiFi: {getConnectionLabel(bluetoothStatus)}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <SafeAreaView style={styles.safe} edges={['bottom']}>
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

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconCircle}>
                <Ionicons name="heart" size={24} color={WT.colors.danger} />
            </View>
            <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Locked heart rate</Text>
                <Text style={styles.summaryValue}>
                {capturedHeartRate ? `${capturedHeartRate.bpm} BPM` : '--'}
                </Text>
            </View>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="flash-outline" size={16} color={WT.colors.primary} />
                <Text style={styles.metricTitle}>EMG Signal</Text>
              </View>
              <Text style={styles.metricValue}>
                {emgSample ? `${emgSample.rmsAmplitude.toFixed(1)} uV` : 'Waiting'}
              </Text>
              <Text style={styles.metricSubtext}>
                {emgSample
                  ? `${Math.round(emgSample.fatigueScore * 100)}% fatigue`
                  : 'Hold muscle tension'}
              </Text>
              <View style={styles.miniProgressBg}>
                 <View style={[styles.miniProgressFill, { width: `${emgProgress}%` }]} />
              </View>
              <Text style={styles.metricProgress}>
                Samples: {emgReadingCount}/{requiredEmgReadings}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="speedometer-outline" size={16} color={WT.colors.primary} />
                <Text style={styles.metricTitle}>Velocity</Text>
              </View>
              <Text style={styles.metricValue}>
                {velocityReading
                  ? `${velocityReading.velocityMps.toFixed(2)} m/s`
                  : liveVelocity
                    ? `${liveVelocity.toFixed(2)} m/s`
                    : 'Waiting'}
              </Text>
              <Text style={styles.metricSubtext}>
                {velocityReady
                  ? `${velocityReading?.velocityLossPct.toFixed(1)}% loss`
                  : '3 smooth movements'}
              </Text>
              <View style={styles.miniProgressBg}>
                 <View style={[styles.miniProgressFill, { width: `${velocityProgress}%` }]} />
              </View>
              <Text style={styles.metricProgress}>
                Reps: {velocityRepCount}/{requiredVelocityReps}
              </Text>
            </View>
          </View>

          <View style={styles.instructionsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="book-outline" size={18} color={WT.colors.primary} />
              <Text style={styles.instructionsTitle}>Guide</Text>
            </View>
            <Text style={styles.instructionsText}>1. Stay connected to ESP32 WiFi.</Text>
            <Text style={styles.instructionsText}>
              2. Perform smooth movements for velocity.
            </Text>
            <Text style={styles.instructionsText}>
              3. Hold position for EMG windows.
            </Text>
            
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={16} color={WT.colors.primary} />
              <Text style={styles.instructionsTimer}>Elapsed: {processingElapsedSec}s</Text>
            </View>
            
            {sensorError ? (
                <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={14} color={WT.colors.danger} />
                    <Text style={styles.errorText}>{sensorError}</Text>
                </View>
            ) : null}
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
  // Header
  header: {
    backgroundColor: WT.colors.header,
    paddingHorizontal: WT.spacing.lg,
    paddingBottom: WT.spacing.lg,
    borderBottomLeftRadius: WT.radius.lg,
    borderBottomRightRadius: WT.radius.lg,
    shadowColor: '#4A2878',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerInner: {
    paddingTop: WT.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: WT.colors.textLight,
  },
  statusBadgeRow: {
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(105,195,109,0.3)',
  },
  statusBadgeNeutral: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: WT.colors.textLight,
    textTransform: 'uppercase',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: WT.spacing.lg,
  },
  summaryCard: {
    marginHorizontal: WT.spacing.lg,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...WT.shadow.card,
  },
  summaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(229,107,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    color: WT.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    color: WT.colors.textDark,
    fontSize: 24,
    fontWeight: '800',
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
    gap: 4,
    ...WT.shadow.card,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metricTitle: {
    color: WT.colors.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: WT.colors.textDark,
    fontSize: 18,
    fontWeight: '800',
  },
  metricSubtext: {
    color: WT.colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    height: 28,
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: WT.colors.primary,
    borderRadius: 2,
  },
  metricProgress: {
    color: WT.colors.primary,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'right',
  },
  instructionsCard: {
    marginHorizontal: WT.spacing.lg,
    marginTop: WT.spacing.md,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 8,
    ...WT.shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  instructionsTitle: {
    color: WT.colors.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  instructionsText: {
    color: WT.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  instructionsTimer: {
    color: WT.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229,107,107,0.1)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  errorText: {
    color: WT.colors.danger,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  loadingBridgeCard: {
    marginHorizontal: WT.spacing.lg,
    padding: WT.spacing.md,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    marginBottom: WT.spacing.md,
  },
  loadingBridgeText: {
    color: WT.colors.textMuted,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: WT.spacing.lg,
    paddingVertical: WT.spacing.lg,
    marginTop: WT.spacing.md,
  },
});

export default FatigueProcessingScreen;
