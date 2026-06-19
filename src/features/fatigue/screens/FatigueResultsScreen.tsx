import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FatigueCheckStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../../workout/components/PrimaryWorkoutButton';
import { useFatigueCheck } from '../context/FatigueCheckContext';
import { GOAL_PRESETS } from '../../../../Fatigue-with-HeartRate-main/src/fatigue-engine';

type Props = NativeStackScreenProps<FatigueCheckStackParamList, 'FatigueResults'>;

function formatRest(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (remainder === 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  return `${minutes} minute${minutes === 1 ? '' : 's'} ${remainder} seconds`;
}

const FatigueResultsScreen: React.FC<Props> = ({ navigation }) => {
  const { result, resetSession, trainingGoal } = useFatigueCheck();

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
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <Text style={styles.headerTitle}>Fatigue Result</Text>
            <Text style={styles.headerSubtitle}>
              {action === 'continue'
                ? 'Ready to continue activity'
                : `Suggesting ${formatRest(recommendedRestSec)} rest`}
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
          <View
            style={[
              styles.resultHero,
              action === 'continue' ? styles.resultHeroReady : styles.resultHeroRest,
            ]}
          >
            <View style={styles.resultHeroContent}>
              <View style={styles.resultStatusIcon}>
                <Ionicons 
                  name={action === 'continue' ? 'checkmark-circle' : 'pause-circle'} 
                  size={48} 
                  color={action === 'continue' ? WT.colors.success : WT.colors.warning} 
                />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Fatigue Level</Text>
                <Text style={styles.resultValue}>{fatigueLabel}</Text>
              </View>
            </View>
            <Text style={styles.resultSummary}>{summary}</Text>
          </View>

          <View style={styles.metricsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart-outline" size={18} color={WT.colors.primary} />
              <Text style={styles.cardTitle}>Measurements</Text>
            </View>
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
            <View style={styles.cardHeader}>
              <Ionicons name="analytics-outline" size={18} color={WT.colors.primary} />
              <Text style={styles.cardTitle}>Assessment</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Fatigue index</Text>
              <Text style={styles.metricData}>{assessment.fatigueIndex.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Heart-rate impact</Text>
              <Text style={styles.metricData}>{assessment.breakdown.hrContribution.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>EMG impact</Text>
              <Text style={styles.metricData}>{assessment.breakdown.emgContribution.toFixed(2)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricName}>Velocity impact</Text>
              <Text style={styles.metricData}>{assessment.breakdown.velocityContribution.toFixed(2)}</Text>
            </View>
            <Text style={styles.assessmentNote}>{assessment.recommendation}</Text>
            {missingSignals.length > 0 ? (
              <Text style={styles.warningText}>
                Missing signals: {missingSignals.join(', ')}.
              </Text>
            ) : null}
          </View>

          <View style={styles.footer}>
            {action === 'rest' ? (
              <PrimaryWorkoutButton
                label="Start Rest Timer"
                variant="purple"
                onPress={() => {
                  const goal = trainingGoal ?? 'hypertrophy';
                  const fallbackRest = GOAL_PRESETS[goal].baseRestSec;
                  navigation.navigate('FatigueRest', {
                    restSec: recommendedRestSec || fallbackRest,
                    goal,
                  });
                }}
              />
            ) : (
              <PrimaryWorkoutButton
                label="Back to Start"
                variant="purple"
                onPress={() => {
                  resetSession();
                  navigation.popToTop();
                }}
              />
            )}
            <View style={styles.footerSpacer} />
            <PrimaryWorkoutButton
              label="Run Again"
              variant="white"
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
  resultHero: {
    marginHorizontal: WT.spacing.lg,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.lg,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 16,
    ...WT.shadow.card,
  },
  resultHeroReady: {
    borderColor: WT.colors.success + '40',
  },
  resultHeroRest: {
    borderColor: WT.colors.warning + '40',
  },
  resultHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resultStatusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(140,92,196,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    color: WT.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultValue: {
    color: WT.colors.textDark,
    fontSize: 32,
    fontWeight: '800',
  },
  resultSummary: {
    color: WT.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  metricsCard: {
    marginHorizontal: WT.spacing.lg,
    marginTop: WT.spacing.md,
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 12,
    ...WT.shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    color: WT.colors.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  metricName: {
    color: WT.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  metricData: {
    color: WT.colors.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
  assessmentNote: {
    color: WT.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontStyle: 'italic',
  },
  warningText: {
    color: WT.colors.warning,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
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
    paddingHorizontal: WT.spacing.lg,
    paddingVertical: WT.spacing.lg,
    marginTop: WT.spacing.md,
  },
  footerSpacer: {
    height: WT.spacing.sm,
  },
});

export default FatigueResultsScreen;
