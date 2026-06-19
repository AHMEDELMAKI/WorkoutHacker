import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FatigueCheckStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../../workout/components/PrimaryWorkoutButton';
import { useFatigueCheck } from '../context/FatigueCheckContext';

type Props = NativeStackScreenProps<FatigueCheckStackParamList, 'FatigueRest'>;

function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getGoalLabel(goal: Props['route']['params']['goal']): string {
  switch (goal) {
    case 'strength':
      return 'Strength';
    case 'hypertrophy':
      return 'Hypertrophy';
    case 'endurance':
      return 'Endurance';
    case 'hiit':
      return 'HIIT';
    case 'fat_loss':
      return 'Fat Loss';
    default:
      return 'Recovery';
  }
}

function getGoalReason(goal: Props['route']['params']['goal']): string {
  switch (goal) {
    case 'strength':
      return 'Strength training needs 2-5 min between sets for full muscle and nervous-system recovery.';
    case 'hypertrophy':
      return 'Hypertrophy training uses 60-90s rest to maintain muscular stress and metabolic demand.';
    case 'endurance':
      return 'Endurance training uses 30-60s rest to build fatigue resistance.';
    case 'hiit':
      return 'HIIT commonly uses work-to-rest ratios from 1:1 to 1:4 depending on intensity and fitness level.';
    case 'fat_loss':
      return 'Fat-loss sessions often keep rest short to maintain workout density and energy demand.';
    default:
      return 'This rest time was selected to match your current recovery goal.';
  }
}

const FatigueRestScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restSec, goal } = route.params;
  const { resetSession } = useFatigueCheck();

  const [remaining, setRemaining] = useState(restSec);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused || remaining <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, remaining]);

  const handleSkip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    resetSession();
    navigation.popToTop();
  }, [navigation, resetSession]);

  const handleDone = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    resetSession();
    navigation.popToTop();
  }, [navigation, resetSession]);

  const progress = restSec > 0 ? ((restSec - remaining) / restSec) * 100 : 100;
  const isComplete = remaining <= 0;
  const goalLabel = getGoalLabel(goal);
  const goalReason = getGoalReason(goal);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />

      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <Text style={styles.headerTitle}>Rest Timer</Text>
            <Text style={styles.headerSubtitle}>{goalLabel} - {restSec}s total</Text>
          </View>
        </SafeAreaView>
      </View>

      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.timerCard}>
              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{formatTime(remaining)}</Text>
                <Text style={styles.timerLabel}>
                  {isComplete ? 'Rest complete!' : isPaused ? 'Paused' : 'Resting...'}
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.controls}>
                <Pressable
                  style={[
                    styles.controlBtn,
                    isPaused ? styles.controlBtnResume : styles.controlBtnPause,
                  ]}
                  onPress={() => setIsPaused(!isPaused)}
                >
                  <Ionicons
                    name={isPaused ? 'play' : 'pause'}
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.controlBtnText}>
                    {isPaused ? 'Resume' : 'Pause'}
                  </Text>
                </Pressable>

                <Pressable style={[styles.controlBtn, styles.controlBtnSkip]} onPress={handleSkip}>
                  <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
                  <Text style={styles.controlBtnText}>Skip</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Why this rest time?</Text>
              <View style={styles.infoRow}>
                <Ionicons name="barbell-outline" size={18} color={WT.colors.primary} />
                <Text style={styles.infoText}>{goalReason}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            {isComplete ? (
              <PrimaryWorkoutButton
                label="Done - Back to Start"
                variant="purple"
                onPress={handleDone}
              />
            ) : (
              <PrimaryWorkoutButton
                label="Skip Rest"
                variant="white"
                onPress={handleSkip}
              />
            )}
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
  },
  content: {
    flex: 1,
    paddingHorizontal: WT.spacing.lg,
    paddingTop: WT.spacing.lg,
    gap: WT.spacing.lg,
  },
  timerCard: {
    padding: WT.spacing.lg,
    borderRadius: WT.radius.lg,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    alignItems: 'center',
    gap: 20,
    ...WT.shadow.card,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: WT.colors.primary + '15',
    borderWidth: 4,
    borderColor: WT.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: WT.colors.textDark,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: WT.colors.textMuted,
    marginTop: 4,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: WT.colors.cardBorder,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: WT.colors.primary,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: WT.radius.sm,
  },
  controlBtnPause: {
    backgroundColor: WT.colors.warning,
  },
  controlBtnResume: {
    backgroundColor: WT.colors.success,
  },
  controlBtnSkip: {
    backgroundColor: WT.colors.textMuted,
  },
  controlBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 12,
    ...WT.shadow.card,
  },
  infoTitle: {
    color: WT.colors.textDark,
    fontSize: 18,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    color: WT.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    paddingHorizontal: WT.spacing.lg,
    paddingVertical: WT.spacing.lg,
  },
});

export default FatigueRestScreen;
