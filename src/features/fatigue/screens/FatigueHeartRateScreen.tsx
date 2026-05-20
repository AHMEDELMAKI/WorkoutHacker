import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
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
  const movedForwardRef = useRef(false);

  useEffect(() => {
    if (!capturedHeartRate || movedForwardRef.current) return;

    movedForwardRef.current = true;
    navigation.replace('FatigueProcessing');
  }, [capturedHeartRate, navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.background} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Measure Heart Rate</Text>
            <Text style={styles.subtitle}>
              Cover the back camera and flash with your finger until we lock a stable reading.
            </Text>
          </View>

          <View style={styles.cameraPanel}>
            <CameraHeartRateComponent
              useTorch={!capturedHeartRate}
              showPreview={true}
              onReady={handleCameraReady}
              onReading={handleHeartRateReading}
              onError={handleHeartRateError}
            />
          </View>

          <View style={styles.statusCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Current BPM</Text>
                <Text style={styles.metricValue}>
                  {liveHeartRate ? `${liveHeartRate.bpm}` : '--'}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Confidence</Text>
                <Text style={styles.metricValue}>
                  {liveHeartRate ? `${Math.round(liveHeartRate.confidence * 100)}%` : '--'}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Stable Reads</Text>
                <Text style={styles.metricValue}>
                  {heartRateProgress}/{requiredStableHeartRateReadings}
                </Text>
              </View>
            </View>

            <Text style={styles.statusText}>
              {capturedHeartRate
                ? 'Heart rate locked. Moving to sensor processing...'
                : cameraReady
                  ? 'Measuring with the back camera now.'
                  : 'Starting camera measurement...'}
            </Text>

            {heartRateError ? <Text style={styles.errorText}>{heartRateError}</Text> : null}
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
  cameraPanel: {
    flex: 1,
  },
  statusCard: {
    marginHorizontal: WT.spacing.lg,
    marginBottom: WT.spacing.md,
    padding: WT.spacing.md,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: WT.spacing.sm,
  },
  metricBox: {
    flex: 1,
    padding: WT.spacing.sm,
    borderRadius: 14,
    backgroundColor: 'rgba(167,131,199,0.10)',
  },
  metricLabel: {
    color: WT.colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  metricValue: {
    color: WT.colors.textDark,
    fontSize: 20,
    fontWeight: '800',
  },
  statusText: {
    color: WT.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    color: WT.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: WT.spacing.lg,
    paddingBottom: WT.spacing.md,
  },
});

export default FatigueHeartRateScreen;
