import React, { useCallback, useEffect, useState } from 'react';
import {
  LogBox,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { WT } from '../../../theme/workoutTheme';
import { generatePlan } from '../../../lib/workout-planner';
import type { WorkoutPlan, WorkoutRequest } from '../../../lib/workout-planner/shared/types';
import { userApi, UserProfile } from '../../../services/api/user.api';
import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';

type Goal = 'strength' | 'hypertrophy' | 'other';
type Level = 'beginner' | 'intermediate' | 'advanced';


const API_BASE_URL = 'https://64.226.123.63.nip.io';
const API_ENDPOINT = '/api/workout';
let logRoutingInstalled = false;

function WorkoutPlannerScreen() {
  const [programDurationWeeks, setProgramDurationWeeks] = useState('');
  const [equipmentAvailable, setEquipmentAvailable] = useState('barbell, dumbbell, bodyweight');
  const [trainingAge, setTrainingAge] = useState('');
  const [injuries, setInjuries] = useState('');
  const [mobilityDifficulties, setMobilityDifficulties] = useState('');
  const [currentRPE, setCurrentRPE] = useState('');
  const [naturalLanguageRequest, setNaturalLanguageRequest] = useState('');
  const [currentPlanMode, setCurrentPlanMode] = useState<'none' | 'latest'>('none');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const daysPerWeek = profile?.workoutDaysPerWeek ?? 4;
  const goal: Goal = (() => {
    const pg = profile?.workoutPrimaryGoal;
    if (pg === 'strength' || pg === 'hypertrophy') return pg;
    if (pg) return 'other';
    if (profile?.fitnessGoals?.length) {
      const fg = profile.fitnessGoals[0];
      if (fg.includes('strength')) return 'strength';
      if (fg.includes('muscle')) return 'hypertrophy';
    }
    return 'strength';
  })();
  const customPrimaryGoal = (() => {
    if (goal !== 'other') return '';
    const pg = profile?.workoutPrimaryGoal;
    if (pg && pg !== 'strength' && pg !== 'hypertrophy') return pg;
    if (profile?.fitnessGoals?.length) return profile.fitnessGoals[0].replace(/_/g, ' ');
    return '';
  })();
  const trainingLevel: Level = (() => {
    const fl = profile?.fitnessLevel;
    if (fl === 'athlete' || fl === 'advanced') return 'advanced';
    if (fl === 'intermediate') return 'intermediate';
    if (fl === 'beginner') return 'beginner';
    return 'intermediate';
  })();
  const selectedGender = profile?.gender === 'male' ? 'male' : profile?.gender === 'female' ? 'female' : undefined;
  const bodyWeight = profile?.weight;
  const heightInCm = profile?.height;
  const ageInYears = profile?.age;

  useEffect(() => {
    installMetroLogRouting();
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      console.log('[WorkoutPlannerScreen] Loading user profile...');
      const p = await userApi.getProfile();
      if (p) setProfile(p);
    } catch (err) {
      console.warn('[WorkoutPlannerScreen] Failed to load profile:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [loadUserProfile])
  );

  const onGenerate = async (overrideKey?: string) => {
    const key = overrideKey ?? apiKey;
    if (overrideKey) setApiKey(overrideKey);
    if (!key) {
      setShowApiKeyModal(true);
      return;
    }

    const request: WorkoutRequest = {
      daysPerWeek,
      trainingLevel,
    };

    if (goal !== 'other') {
      request.primaryGoal = goal;
    }

    if (programDurationWeeks.trim()) {
      const parsedDuration = Number(programDurationWeeks);
      if (!Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 52) {
        setError('Program duration must be an integer between 1 and 52 when provided.');
        return;
      }
      request.programDurationWeeks = parsedDuration;
    }

    const parsedEquipment = parseList(equipmentAvailable);
    if (parsedEquipment.length > 0) {
      request.equipmentAvailable = parsedEquipment;
    }

    const demographics: NonNullable<WorkoutRequest['demographics']> = {};
    if (selectedGender) demographics.gender = selectedGender;
    if (bodyWeight) demographics.bodyWeight = bodyWeight;
    if (heightInCm) demographics.height = heightInCm;
    if (ageInYears) demographics.age = ageInYears;
    if (trainingAge.trim()) {
      const parsedTrainingAge = Number(trainingAge);
      if (!Number.isFinite(parsedTrainingAge) || parsedTrainingAge < 0) {
        setError('Training age must be a number greater than or equal to 0 when provided.');
        return;
      }
      demographics.trainingAge = parsedTrainingAge;
    }
    if (Object.keys(demographics).length > 0) {
      request.demographics = demographics;
    }

    const limitations: NonNullable<WorkoutRequest['limitations']> = {};
    const parsedInjuries = parseList(injuries);
    const parsedMobility = parseList(mobilityDifficulties);
    if (parsedInjuries.length > 0) limitations.injuries = parsedInjuries;
    if (parsedMobility.length > 0) limitations.mobilityDifficulties = parsedMobility;
    if (Object.keys(limitations).length > 0) {
      request.limitations = limitations;
    }

    if (currentRPE.trim()) {
      const parsedRpe = Number(currentRPE);
      if (!Number.isFinite(parsedRpe) || parsedRpe < 1 || parsedRpe > 10) {
        setError('Current RPE must be a number between 1 and 10 when provided.');
        return;
      }
      request.currentRPE = parsedRpe;
    }

    if (naturalLanguageRequest.trim() || goal === 'other') {
      const nlParts: string[] = [];
      if (goal === 'other') {
        nlParts.push(`Primary goal: ${customPrimaryGoal}`);
      }
      if (naturalLanguageRequest.trim()) {
        nlParts.push(naturalLanguageRequest.trim());
      }
      request.naturalLanguageRequest = nlParts.join('\n\n');
    }

    if (currentPlanMode === 'latest') {
      if (!plan) {
        setError('Generate a plan first, then enable "Use latest generated plan".');
        return;
      }
      request.currentPlan = plan;
    }

    console.debug('[app] submitting workout request', request);

    setLoading(true);
    setError(null);

    try {
      const generated = await generatePlan(
        { 
          apiBaseUrl: API_BASE_URL,
          endpointPath: API_ENDPOINT,
          headers: { 'x-api-key': key }
        }, 
        request
      );
      console.debug('[app] received workout plan', {
        planName: generated.planName,
        days: generated.days.length,
      });
      setPlan(generated);
    } catch (e) {
      console.error('[app] generate plan failed', e);
      setPlan(null);
      const msg = e instanceof Error ? e.message : '';
      if (msg.toLowerCase().includes('unauthorized')) {
        setApiKey('');
        setShowApiKeyModal(true);
      } else {
        setError(msg || 'Failed to generate workout plan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPlanHumanReadable = (p: WorkoutPlan): string => {
    const lines: string[] = [];
    lines.push(`Workout Plan: ${p.planName}`);
    lines.push(`Primary Goal: ${p.primaryGoal}`);
    lines.push(`Training Level: ${p.trainingLevel}`);
    lines.push(`Days Per Week: ${p.daysPerWeek}`);
    lines.push(`Duration: ${p.durationWeeks ? `${p.durationWeeks} weeks` : 'Not specified'}`);
    lines.push('');
    lines.push(`Rationale: ${p.rationale}`);
    lines.push(`Inter-set Recovery: ${p.interSetRecoveryPolicy}`);
    lines.push('');

    if (p.progressiveOverload.length > 0) {
      lines.push('Progressive Overload:');
      for (const rule of p.progressiveOverload) {
        lines.push(`  - ${rule.ruleName}: ${rule.description}`);
      }
      lines.push('');
    }

    for (const day of p.days) {
      lines.push(`Day ${day.dayLabel}: ${day.focus}`);
      if (day.warmup && day.warmup.length > 0) {
        lines.push('  Warmup:');
        for (const w of day.warmup) {
          lines.push(`    - ${w}`);
        }
      }
      for (const ex of day.exercises) {
        const { sets, weight, reps, rest, targetRpe } = ex.sets;
        const weightStr = weight > 0 ? `${weight} kg` : 'bodyweight';
        lines.push(`  ${ex.exerciseName} (${ex.equipment})${ex.notes ? ` - ${ex.notes}` : ''}`);
        lines.push(`    ${sets}×${reps} @ ${weightStr}, RPE ${targetRpe}, rest ${rest}s`);
      }
      lines.push('');
    }

    return lines.join('\n');
  };

  const onCopy = () => {
    if (plan) {
      Clipboard.setString(formatPlanHumanReadable(plan));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <AppText variant="h2" color={WT.colors.textLight} style={styles.headerTitle}>
              Workout Planner
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.80)">
              Generate custom AI-powered training plans
            </AppText>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <AppText variant="caption" style={styles.sectionLabel}>PROFILE</AppText>
          <View style={styles.profileSummary}>
            <AppText variant="bodySmall" color={WT.colors.textDark}>
              {daysPerWeek} days/week · {goal === 'other' ? customPrimaryGoal : goal} · {trainingLevel}
              {selectedGender ? ` · ${selectedGender}` : ''}
              {bodyWeight ? ` · ${bodyWeight}kg` : ''}
              {heightInCm ? ` · ${heightInCm}cm` : ''}
              {ageInYears ? ` · ${ageInYears}yo` : ''}
            </AppText>
          </View>

          <View style={styles.divider} />

          <AppText variant="caption" style={styles.sectionLabel}>EXTRAS</AppText>

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Program duration (weeks, optional)</AppText>
          <TextInput
            value={programDurationWeeks}
            onChangeText={setProgramDurationWeeks}
            keyboardType="number-pad"
            placeholder="e.g. 8"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Equipment available</AppText>
          <TextInput
            value={equipmentAvailable}
            onChangeText={setEquipmentAvailable}
            placeholder="barbell, dumbbell, bodyweight"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Training Age (years)</AppText>
          <TextInput
            value={trainingAge}
            onChangeText={setTrainingAge}
            keyboardType="decimal-pad"
            placeholder="e.g. 3"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <View style={styles.divider} />

          <AppText variant="caption" style={styles.sectionLabel}>LIMITATIONS (OPTIONAL)</AppText>
          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Injuries</AppText>
          <TextInput
            value={injuries}
            onChangeText={setInjuries}
            placeholder="Injuries (comma-separated)"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />
          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Mobility</AppText>
          <TextInput
            value={mobilityDifficulties}
            onChangeText={setMobilityDifficulties}
            placeholder="e.g. tight hips"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <View style={styles.divider} />

          <AppText variant="caption" style={styles.sectionLabel}>ADDITIONAL CONTEXT</AppText>
          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Current RPE (1-10)</AppText>
          <TextInput
            value={currentRPE}
            onChangeText={setCurrentRPE}
            keyboardType="decimal-pad"
            placeholder="e.g. 8"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Custom Request</AppText>
          <TextInput
            value={naturalLanguageRequest}
            onChangeText={setNaturalLanguageRequest}
            placeholder="I only have 45 minutes on weekdays..."
            placeholderTextColor={WT.colors.textMuted}
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.multilineInput]}
          />

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Context Mode</AppText>
          <View style={styles.row}>
            <Choice
              label="None"
              active={currentPlanMode === 'none'}
              onPress={() => setCurrentPlanMode('none')}
            />
            <Choice
              label="Latest Plan"
              active={currentPlanMode === 'latest'}
              onPress={() => setCurrentPlanMode('latest')}
            />
          </View>

          <AppButton
            title={loading ? 'Thinking...' : 'Generate Plan'}
            onPress={onGenerate}
            loading={loading}
            style={styles.generateButton}
          />

          {error ? (
            <AppText variant="bodySmall" color={WT.colors.danger} style={styles.errorText}>
              {error}
            </AppText>
          ) : null}
        </View>

        {plan ? (
          <View style={styles.card}>
            <View style={styles.labelRow}>
              <AppText variant="caption" style={styles.sectionLabel}>YOUR PLAN</AppText>
              <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
                <AppText variant="caption" bold color={WT.colors.primary}>
                  {copied ? 'Copied!' : 'Copy Plan'}
                </AppText>
              </TouchableOpacity>
            </View>
            <View style={styles.planContainer}>
              <AppText style={styles.planText}>{formatPlanHumanReadable(plan)}</AppText>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText variant="h3" color={WT.colors.textDark} style={styles.modalTitle}>
              API Key Required
            </AppText>
            <AppText variant="bodySmall" color={WT.colors.textDark} style={{ marginBottom: 16 }}>
              Enter your API key to generate a workout plan.
            </AppText>
            <TextInput
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter API key"
              placeholderTextColor={WT.colors.textMuted}
              style={styles.modalInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowApiKeyModal(false)}
              >
                <AppText variant="bodySmall" bold color={WT.colors.primary}>
                  Cancel
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={() => {
                  if (!apiKey.trim()) return;
                  setShowApiKeyModal(false);
                  onGenerate(apiKey);
                }}
              >
                <AppText variant="bodySmall" bold color={WT.colors.textLight}>
                  Generate
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.choice, active ? styles.choiceActive : null]} onPress={onPress}>
      <AppText variant="bodySmall" bold color={active ? WT.colors.textLight : WT.colors.primary}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WT.colors.background,
  },
  header: {
    backgroundColor: WT.colors.header,
    borderBottomLeftRadius: WT.radius.lg,
    borderBottomRightRadius: WT.radius.lg,
    paddingHorizontal: WT.spacing.lg,
    paddingBottom: WT.spacing.lg,
    ...WT.shadow.card,
  },
  headerInner: {
    paddingTop: WT.spacing.md,
  },
  headerTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  container: {
    padding: WT.spacing.lg,
    paddingBottom: WT.spacing.xl * 2,
  },
  card: {
    backgroundColor: WT.colors.card,
    borderRadius: WT.radius.md,
    padding: WT.spacing.lg,
    marginBottom: WT.spacing.lg,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    ...WT.shadow.card,
  },
  sectionLabel: {
    fontWeight: '700',
    color: WT.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: WT.spacing.md,
  },
  fieldLabel: {
    marginBottom: 4,
    marginTop: WT.spacing.sm,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    borderRadius: WT.radius.sm,
    paddingHorizontal: WT.spacing.md,
    height: 48,
    fontSize: 15,
    color: WT.colors.textDark,
  },
  multilineInput: {
    height: 100,
    paddingTop: WT.spacing.sm,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WT.spacing.xs,
    marginTop: 2,
  },
  profileSummary: {
    backgroundColor: '#F0F4FF',
    borderRadius: WT.radius.sm,
    padding: WT.spacing.md,
    borderWidth: 1,
    borderColor: WT.colors.primary + '30',
  },
  divider: {
    height: 1,
    backgroundColor: WT.colors.cardBorder,
    marginVertical: WT.spacing.lg,
    opacity: 0.5,
  },
  choice: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: WT.colors.primary,
    paddingHorizontal: WT.spacing.md,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  choiceActive: {
    backgroundColor: WT.colors.primary,
  },
  generateButton: {
    marginTop: WT.spacing.lg,
  },
  errorText: {
    marginTop: WT.spacing.sm,
    textAlign: 'center',
  },
  planContainer: {
    backgroundColor: '#F8F9FB',
    borderRadius: WT.radius.sm,
    padding: WT.spacing.md,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
  },
  planText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 13,
    lineHeight: 20,
    color: WT.colors.textDark,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: WT.spacing.md,
  },
  copyButton: {
    paddingHorizontal: WT.spacing.sm,
    paddingVertical: 4,
    borderRadius: WT.radius.sm,
    borderWidth: 1,
    borderColor: WT.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: WT.spacing.lg,
  },
  modalContent: {
    backgroundColor: WT.colors.card,
    borderRadius: WT.radius.md,
    padding: WT.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    borderRadius: WT.radius.sm,
    paddingHorizontal: WT.spacing.md,
    height: 48,
    fontSize: 15,
    color: WT.colors.textDark,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: WT.spacing.sm,
  },
  modalCancelButton: {
    paddingHorizontal: WT.spacing.md,
    paddingVertical: 10,
    borderRadius: WT.radius.sm,
    borderWidth: 1,
    borderColor: WT.colors.primary,
  },
  modalSubmitButton: {
    paddingHorizontal: WT.spacing.md,
    paddingVertical: 10,
    borderRadius: WT.radius.sm,
    backgroundColor: WT.colors.primary,
  },
});


function parseList(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

function installMetroLogRouting(): void {
  if (logRoutingInstalled) {
    return;
  }

  logRoutingInstalled = true;
  LogBox.ignoreAllLogs(true);
}

export default WorkoutPlannerScreen;
