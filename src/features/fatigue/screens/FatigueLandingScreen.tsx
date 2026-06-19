import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FatigueCheckStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../../workout/components/PrimaryWorkoutButton';
import { useFatigueCheck } from '../context/FatigueCheckContext';
import type { TrainingGoal } from '../../../../Fatigue-with-HeartRate-main/src/fatigue-engine';

type Props = NativeStackScreenProps<FatigueCheckStackParamList, 'FatigueLanding'>;

interface GoalOption {
  goal: TrainingGoal;
  label: string;
  subtitle: string;
  icon: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    goal: 'strength',
    label: 'Strength',
    subtitle: '2-5 min rest between sets',
    icon: 'barbell-outline',
  },
  {
    goal: 'hypertrophy',
    label: 'Hypertrophy',
    subtitle: '60-90s rest between sets',
    icon: 'fitness-outline',
  },
  {
    goal: 'endurance',
    label: 'Endurance',
    subtitle: '30-60s rest between sets',
    icon: 'walk-outline',
  },
  {
    goal: 'hiit',
    label: 'HIIT',
    subtitle: '1:1 to 1:4 work-to-rest ratio',
    icon: 'flash-outline',
  },
  {
    goal: 'fat_loss',
    label: 'Fat Loss',
    subtitle: 'Short rest to keep density high',
    icon: 'flame-outline',
  },
];

const FatigueLandingScreen: React.FC<Props> = ({ navigation }) => {
  const { resetSession, trainingGoal, setTrainingGoal } = useFatigueCheck();

  const handleStart = useCallback(() => {
    resetSession();
    navigation.navigate('FatigueHeartRate');
  }, [navigation, resetSession]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />

      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Fatigue Check</Text>
              <View style={styles.headerIconCircle}>
                <Ionicons name="fitness-outline" size={20} color={WT.colors.header} />
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Measure before you push or rest</Text>
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
            <View style={styles.heroCard}>
              <Text style={styles.eyebrow}>Why measure?</Text>
              <Text style={styles.title}>Decide with data, not just feeling.</Text>
              <Text style={styles.subtitle}>
                We will measure your heart rate first, then collect EMG and velocity data, and
                finally show whether you should continue your activity or rest longer.
              </Text>
            </View>

            <View style={styles.goalCard}>
              <Text style={styles.goalTitle}>What is your training goal?</Text>
              <Text style={styles.goalSubtitle}>
                Your goal affects how fatigue is evaluated and how much rest is recommended.
              </Text>
              <View style={styles.goalOptions}>
                {GOAL_OPTIONS.map((opt) => {
                  const selected = trainingGoal === opt.goal;
                  return (
                    <Pressable
                      key={opt.goal}
                      style={[
                        styles.goalOption,
                        selected && styles.goalOptionSelected,
                      ]}
                      onPress={() => setTrainingGoal(opt.goal)}
                    >
                      <View style={styles.goalOptionRow}>
                        <View
                          style={[
                            styles.goalIconCircle,
                            selected && styles.goalIconCircleSelected,
                          ]}
                        >
                          <Ionicons
                            name={opt.icon}
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={styles.goalOptionContent}>
                          <Text
                            style={[
                              styles.goalOptionLabel,
                              selected && styles.goalOptionLabelSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          <Text style={styles.goalOptionSubtitle}>{opt.subtitle}</Text>
                        </View>
                        <Ionicons
                          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={selected ? WT.colors.primary : WT.colors.textMuted}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>What happens next</Text>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Lock heart-rate with the camera.</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Collect EMG and movement data.</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Get your fatigue recommendation.</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <PrimaryWorkoutButton
              label="Start Measurement"
              variant="purple"
              onPress={handleStart}
            />
            <View style={styles.footerSpacer} />
            <PrimaryWorkoutButton
              label="Back to Home"
              variant="white"
              onPress={() => navigation.getParent()?.goBack()}
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
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  heroCard: {
    padding: WT.spacing.lg,
    borderRadius: WT.radius.lg,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 12,
    ...WT.shadow.card,
  },
  eyebrow: {
    color: WT.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: WT.colors.textDark,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: WT.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  goalCard: {
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 12,
    ...WT.shadow.card,
  },
  goalTitle: {
    color: WT.colors.textDark,
    fontSize: 18,
    fontWeight: '800',
  },
  goalSubtitle: {
    color: WT.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  goalOptions: {
    gap: 8,
  },
  goalOption: {
    padding: WT.spacing.md,
    borderRadius: WT.radius.sm,
    backgroundColor: WT.colors.background,
    borderWidth: 1.5,
    borderColor: WT.colors.cardBorder,
  },
  goalOptionSelected: {
    borderColor: WT.colors.primary,
    backgroundColor: WT.colors.primary + '08',
  },
  goalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WT.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconCircleSelected: {
    backgroundColor: WT.colors.header,
  },
  goalOptionContent: {
    flex: 1,
  },
  goalOptionLabel: {
    color: WT.colors.textDark,
    fontSize: 15,
    fontWeight: '700',
  },
  goalOptionLabelSelected: {
    color: WT.colors.primary,
  },
  goalOptionSubtitle: {
    color: WT.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  stepsCard: {
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 16,
    ...WT.shadow.card,
  },
  stepsTitle: {
    color: WT.colors.textDark,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: WT.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepText: {
    color: WT.colors.textDark,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    paddingHorizontal: WT.spacing.lg,
    paddingVertical: WT.spacing.lg,
  },
  footerSpacer: {
    height: WT.spacing.sm,
  },
});

export default FatigueLandingScreen;
