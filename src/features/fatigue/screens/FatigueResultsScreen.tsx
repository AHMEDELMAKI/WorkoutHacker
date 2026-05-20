import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FatigueCheckStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../../workout/components/PrimaryWorkoutButton';
import { useFatigueCheck } from '../context/FatigueCheckContext';

type Props = NativeStackScreenProps<FatigueCheckStackParamList, 'FatigueResults'>;

function formatRest(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (remainder === 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  return `${minutes} minute${minutes === 1 ? '' : 's'} ${remainder} seconds`;
}

const FatigueResultsScreen: React.FC<Props> = ({ navigation }) => {
  const { result, resetSession } = useFatigueCheck();

  const handleBackToHome = () => {
    resetSession();
    navigation.getParent()?.navigate('Main' as never);
  };

  if (!result) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={WT.colors.background} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topActions}>
            <PrimaryWorkoutButton
              label="Back to Home"
              variant="white"
              onPress={handleBackToHome}
            />
          </View>

          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No result yet</Text>
            <Text style={styles.emptyText}>Run the fatigue check again to generate a result.</Text>
          </View>

          <View style={styles.footer}>
            <PrimaryWorkoutButton
              label="Back to Start"
              variant="white"
              onPress={() => navigation.popToTop()}
            />
            <View style={styles.footerSpacer} />
            <PrimaryWorkoutButton
              label="Back to Home"
              variant="purple"
              onPress={handleBackToHome}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      </View>
    );
  }

  const { snapshot, assessment, action, fatigueLabel, recommendedRestSec, summary, missingSignals } = result;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.background} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topActions}>
            <PrimaryWorkoutButton
              label="Back to Home"
              variant="white"
              onPress={handleBackToHome}
            />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Fatigue Result</Text>
            <Text style={styles.subtitle}>
              {action === 'continue'
                ? 'Your readings support continuing your activity.'
                : `Your readings suggest resting for ${formatRest(recommendedRestSec)}.`}
            </Text>
          </View>

          <View
            style={[
              styles.resultHero,
              action === 'continue' ? styles.resultHeroReady : styles.resultHeroRest,
            ]}
          >
            <Text style={styles.resultLabel}>Fatigue level</Text>
            <Text style={styles.resultValue}>{fatigueLabel}</Text>
            <Text style={styles.resultSummary}>{summary}</Text>
          </View>

          <View style={styles.metricsCard}>
            <Text style={styles.cardTitle}>Measurements</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Heart rate</Text>
              <Text style={styles.metricData}>
                {snapshot.heartRate !== null ? `${snapshot.heartRate} bpm` : 'Not captured'}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>EMG RMS</Text>
              <Text style={styles.metricData}>
                {snapshot.emgRMS !== null ? `${snapshot.emgRMS.toFixed(1)} uV` : 'No EMG sample'}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>EMG fatigue</Text>
              <Text style={styles.metricData}>
                {snapshot.emgFatigue !== null
                  ? `${Math.round(snapshot.emgFatigue * 100)}%`
                  : 'No EMG sample'}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Velocity</Text>
              <Text style={styles.metricData}>
                {snapshot.velocityMps !== null
                  ? `${snapshot.velocityMps.toFixed(2)} m/s`
                  : 'No movement data'}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Velocity loss</Text>
              <Text style={styles.metricData}>
                {snapshot.velocityLossPct !== null
                  ? `${snapshot.velocityLossPct.toFixed(1)}%`
                  : 'Need 2 movements'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsCard}>
            <Text style={styles.cardTitle}>Assessment</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Fatigue index</Text>
              <Text style={styles.metricData}>{assessment.fatigueIndex.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Heart-rate contribution</Text>
              <Text style={styles.metricData}>{assessment.breakdown.hrContribution.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>EMG contribution</Text>
              <Text style={styles.metricData}>{assessment.breakdown.emgContribution.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Velocity contribution</Text>
              <Text style={styles.metricData}>{assessment.breakdown.velocityContribution.toFixed(2)}</Text>
            </View>
            <Text style={styles.assessmentNote}>{assessment.recommendation}</Text>
            {missingSignals.length > 0 ? (
              <Text style={styles.warningText}>
                Missing for this run: {missingSignals.join(', ')}.
              </Text>
            ) : null}
          </View>

          <View style={styles.footer}>
            <PrimaryWorkoutButton
              label="Run Again"
              variant="purple"
              onPress={() => {
                resetSession();
                navigation.popToTop();
              }}
            />
            <View style={styles.footerSpacer} />
            <PrimaryWorkoutButton
              label="Back to Home"
              variant="white"
              onPress={handleBackToHome}
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
  topActions: {
    paddingHorizontal: WT.spacing.lg,
    paddingTop: WT.spacing.sm,
    paddingBottom: WT.spacing.xs,
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
  resultHero: {
    marginHorizontal: WT.spacing.lg,
    marginTop: WT.spacing.md,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.lg,
    gap: 8,
  },
  resultHeroReady: {
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
  },
  resultHeroRest: {
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
  },
  resultLabel: {
    color: WT.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultValue: {
    color: WT.colors.textDark,
    fontSize: 34,
    fontWeight: '800',
  },
  resultSummary: {
    color: WT.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  metricsCard: {
    marginHorizontal: WT.spacing.lg,
    marginTop: WT.spacing.md,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 10,
  },
  cardTitle: {
    color: WT.colors.textDark,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metricName: {
    color: WT.colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  metricData: {
    color: WT.colors.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  assessmentNote: {
    color: WT.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  warningText: {
    color: WT.colors.warning,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: WT.spacing.lg,
    gap: 10,
  },
  emptyTitle: {
    color: WT.colors.textDark,
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    color: WT.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: WT.spacing.lg,
    paddingVertical: WT.spacing.md,
  },
  footerSpacer: {
    height: WT.spacing.sm,
  },
});

export default FatigueResultsScreen;
