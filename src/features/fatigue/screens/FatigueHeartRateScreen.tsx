import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StatusBar, StyleSheet, Text, View, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraHeartRateComponent } from '../../../../Fatigue-with-HeartRate-main/src/react-native/CameraHeartRateComponent';
import type { FatigueCheckStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../../workout/components/PrimaryWorkoutButton';
import { useFatigueCheck } from '../context/FatigueCheckContext';

type Props = NativeStackScreenProps<FatigueCheckStackParamList, 'FatigueHeartRate'>;

const FatigueHeartRateScreen: React.FC<Props> = ({ navigation }) => {
  const {
    liveHeartRate,
    capturedHeartRate,
    heartRateProgress,
    requiredStableHeartRateReadings,
    cameraReady,
    heartRateError,
    handleCameraReady,
    handleHeartRateReading,
    handleHeartRateError,
  } = useFatigueCheck();
  
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const movedForwardRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // First check if already granted
        const alreadyGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (alreadyGranted) {
          setPermissionGranted(true);
          return;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'WorkoutHacker needs camera access to measure your heart rate.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn('[FatigueHeartRate] Permission check error:', err);
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (liveHeartRate) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [liveHeartRate, pulseAnim]);

  useEffect(() => {
    if (!capturedHeartRate || movedForwardRef.current) return;

    movedForwardRef.current = true;
    navigation.replace('FatigueProcessing');
  }, [capturedHeartRate, navigation]);

  const progressPct = (heartRateProgress / requiredStableHeartRateReadings) * 100;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <Text style={styles.headerTitle}>Heart Rate</Text>
            <Text style={styles.headerSubtitle}>
              Cover the back camera and flash with your finger.
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cameraContainer}>
            <View style={styles.cameraFrame}>
              {permissionGranted ? (
                <CameraHeartRateComponent
                  useTorch={!capturedHeartRate}
                  showPreview={false}
                  headless={true}
                  onReady={handleCameraReady}
                  onReading={handleHeartRateReading}
                  onError={handleHeartRateError}
                />
              ) : permissionGranted === false ? (
                <View style={styles.permissionError}>
                   <Ionicons name="lock-closed" size={40} color={WT.colors.danger} />
                   <Text style={styles.permissionErrorText}>Camera access denied</Text>
                </View>
              ) : null}
              
              <View style={styles.cameraOverlay}>
                 <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
                    <Ionicons 
                        name="heart" 
                        size={80} 
                        color={liveHeartRate ? WT.colors.danger : 'rgba(255,255,255,0.1)'} 
                    />
                    <Text style={styles.cameraActiveLabel}>
                        {cameraReady ? 'CAMERA ACTIVE' : 'INITIALIZING...'}
                    </Text>
                 </Animated.View>
              </View>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
            </View>
            <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>SIGNAL LOCK</Text>
                <Text style={styles.progressValue}>{Math.round(progressPct)}%</Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricBox}>
                <Ionicons name="pulse" size={18} color={WT.colors.primary} style={styles.metricIcon} />
                <Text style={styles.metricLabel}>BPM</Text>
                <Text style={styles.metricValue}>
                  {liveHeartRate ? `${liveHeartRate.bpm}` : '--'}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Ionicons name="shield-checkmark-outline" size={18} color={WT.colors.primary} style={styles.metricIcon} />
                <Text style={styles.metricLabel}>Quality</Text>
                <Text style={styles.metricValue}>
                  {liveHeartRate ? `${Math.round(liveHeartRate.confidence * 100)}%` : '--'}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Ionicons name="sync-outline" size={18} color={WT.colors.primary} style={styles.metricIcon} />
                <Text style={styles.metricLabel}>Stable</Text>
                <Text style={styles.metricValue}>
                  {heartRateProgress}/{requiredStableHeartRateReadings}
                </Text>
              </View>
            </View>

            <View style={styles.statusInfoBox}>
              <Ionicons 
                name={cameraReady ? "videocam-outline" : "hourglass-outline"} 
                size={20} 
                color={WT.colors.primary} 
              />
              <Text style={styles.statusText}>
                {capturedHeartRate
                  ? 'Locked! Transitioning...'
                  : cameraReady
                    ? 'Place finger firmly over camera and wait for stabilization.'
                    : 'Initializing camera sensor...'}
              </Text>
            </View>

            {heartRateError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={WT.colors.danger} />
                <Text style={styles.errorText}>{heartRateError}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.footer}>
            <PrimaryWorkoutButton
              label="Cancel Check"
              variant="white"
              onPress={() => navigation.goBack()}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: WT.colors.textLight,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: WT.spacing.lg,
  },
  cameraContainer: {
    alignItems: 'center',
    paddingHorizontal: WT.spacing.lg,
  },
  cameraFrame: {
    width: '100%',
    height: 260,
    borderRadius: WT.radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    ...WT.shadow.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cameraActiveLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: 2,
  },
  permissionError: {
    alignItems: 'center',
    gap: 12,
  },
  permissionErrorText: {
    color: WT.colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: WT.spacing.lg,
    marginHorizontal: WT.spacing.lg,
    gap: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: WT.colors.textLight,
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  progressValue: {
    color: WT.colors.textLight,
    fontSize: 11,
    fontWeight: '800',
  },
  statusCard: {
    marginTop: WT.spacing.lg,
    marginHorizontal: WT.spacing.lg,
    marginBottom: WT.spacing.md,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 20,
    ...WT.shadow.card,
  },
  metricRow: {
    flexDirection: 'row',
    gap: WT.spacing.sm,
  },
  metricBox: {
    flex: 1,
    paddingVertical: WT.spacing.md,
    paddingHorizontal: WT.spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(140,92,196,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(140,92,196,0.1)',
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricLabel: {
    color: WT.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    color: WT.colors.textDark,
    fontSize: 20,
    fontWeight: '900',
  },
  statusInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(140,92,196,0.04)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,92,196,0.08)',
  },
  statusText: {
    color: WT.colors.textDark,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229,107,107,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: WT.colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    paddingHorizontal: WT.spacing.lg,
    paddingBottom: WT.spacing.lg,
    marginTop: WT.spacing.md,
  },
});

export default FatigueHeartRateScreen;
