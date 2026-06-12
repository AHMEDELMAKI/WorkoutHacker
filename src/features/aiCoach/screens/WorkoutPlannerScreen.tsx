import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LogBox,
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
import { secureStorage } from '../../../services/secureStorage';
import { userApi } from '../../../services/api/user.api';
import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';

type Goal = 'strength' | 'hypertrophy' | 'other';
type Level = 'beginner' | 'intermediate' | 'advanced';
type PlanGoal = WorkoutPlan['primaryGoal'];
type GenderOption = 'not_specified' | 'male' | 'female';

const API_BASE_URL = 'https://gymhacker.onrender.com';
const API_ENDPOINT = '/workout';
let logRoutingInstalled = false;

function WorkoutPlannerScreen() {
  const [daysPerWeek, setDaysPerWeek] = useState('4');
  const [goal, setGoal] = useState<Goal>('strength');
  const [customPrimaryGoal, setCustomPrimaryGoal] = useState('');
  const [trainingLevel, setTrainingLevel] = useState<Level>('intermediate');
  const [programDurationWeeks, setProgramDurationWeeks] = useState('');
  const [equipmentAvailable, setEquipmentAvailable] = useState('barbell, dumbbell, bodyweight');
  const [genderOption, setGenderOption] = useState<GenderOption>('not_specified');
  const [bodyWeight, setBodyWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [trainingAge, setTrainingAge] = useState('');
  const [injuries, setInjuries] = useState('');
  const [mobilityDifficulties, setMobilityDifficulties] = useState('');
  const [currentRPE, setCurrentRPE] = useState('');
  const [naturalLanguageRequest, setNaturalLanguageRequest] = useState('');
  const [currentPlanMode, setCurrentPlanMode] = useState<'none' | 'latest' | 'manual'>('none');
  const [currentPlanName, setCurrentPlanName] = useState('');
  const [currentPlanPrimaryGoal, setCurrentPlanPrimaryGoal] = useState<PlanGoal>('strength');
  const [currentPlanTrainingLevel, setCurrentPlanTrainingLevel] = useState<Level>('intermediate');
  const [currentPlanDaysPerWeek, setCurrentPlanDaysPerWeek] = useState('');
  const [currentPlanDurationWeeks, setCurrentPlanDurationWeeks] = useState('');
  const [currentPlanRationale, setCurrentPlanRationale] = useState('');
  const [currentPlanInterSetRecoveryPolicy, setCurrentPlanInterSetRecoveryPolicy] = useState('');
  const [currentPlanProgressiveOverload, setCurrentPlanProgressiveOverload] = useState('');
  const [currentPlanDayLabel, setCurrentPlanDayLabel] = useState('');
  const [currentPlanDayFocus, setCurrentPlanDayFocus] = useState('');
  const [currentPlanDayWarmup, setCurrentPlanDayWarmup] = useState('');
  const [currentPlanExerciseName, setCurrentPlanExerciseName] = useState('');
  const [currentPlanExerciseEquipment, setCurrentPlanExerciseEquipment] = useState('');
  const [currentPlanExerciseNotes, setCurrentPlanExerciseNotes] = useState('');
  const [currentPlanExerciseSets, setCurrentPlanExerciseSets] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const selectedGender = resolveGenderValue(genderOption);

  useEffect(() => {
    installMetroLogRouting();
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      console.log('[WorkoutPlannerScreen] Pre-filling user profile data...');
      const profile = await userApi.getProfile();
      if (profile) {
        if (profile.workoutDaysPerWeek) setDaysPerWeek(profile.workoutDaysPerWeek.toString());
        if (profile.height) setHeight(profile.height.toString());
        if (profile.weight) setBodyWeight(profile.weight.toString());
        if (profile.age) setAge(profile.age.toString());
        
        if (profile.gender === 'male' || profile.gender === 'female') {
          setGenderOption(profile.gender as GenderOption);
        }

        if (profile.fitnessLevel) {
          if (profile.fitnessLevel === 'athlete') {
            setTrainingLevel('advanced');
          } else if (['beginner', 'intermediate', 'advanced'].includes(profile.fitnessLevel)) {
            setTrainingLevel(profile.fitnessLevel as Level);
          }
        }

        // Set primary goal if it matches one of our options
        if (profile.workoutPrimaryGoal === 'strength' || profile.workoutPrimaryGoal === 'hypertrophy') {
          setGoal(profile.workoutPrimaryGoal as Goal);
        } else if (profile.workoutPrimaryGoal) {
          setGoal('other');
          setCustomPrimaryGoal(profile.workoutPrimaryGoal);
        } else if (profile.fitnessGoals && profile.fitnessGoals.length > 0) {
          // Fallback to fitness goals from onboarding
          const primary = profile.fitnessGoals[0];
          if (primary.includes('strength')) setGoal('strength');
          else if (primary.includes('muscle')) setGoal('hypertrophy');
          else {
            setGoal('other');
            setCustomPrimaryGoal(primary.replace(/_/g, ' '));
          }
        }
      }
    } catch (err) {
      console.warn('[WorkoutPlannerScreen] Failed to pre-fill profile data:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [loadUserProfile])
  );

  const requestPreview = useMemo(() => {
    const preview: Record<string, unknown> = {
      daysPerWeek: Number(daysPerWeek),
      trainingLevel,
    };

    if (goal === 'other') {
      if (customPrimaryGoal.trim()) {
        preview.primaryGoal = customPrimaryGoal.trim();
      }
    } else {
      preview.primaryGoal = goal;
    }

    const duration = Number(programDurationWeeks);
    if (programDurationWeeks.trim() && Number.isFinite(duration)) {
      preview.programDurationWeeks = duration;
    }

    const equipment = parseList(equipmentAvailable);
    if (equipment.length > 0) {
      preview.equipmentAvailable = equipment;
    }

    const demographics: Record<string, unknown> = {};
    if (selectedGender) demographics.gender = selectedGender;
    if (bodyWeight.trim()) demographics.bodyWeight = Number(bodyWeight);
    if (height.trim()) demographics.height = Number(height);
    if (age.trim()) demographics.age = Number(age);
    if (trainingAge.trim()) demographics.trainingAge = Number(trainingAge);
    if (Object.keys(demographics).length > 0) {
      preview.demographics = demographics;
    }

    const limitations: Record<string, unknown> = {};
    const parsedInjuries = parseList(injuries);
    const parsedMobility = parseList(mobilityDifficulties);
    if (parsedInjuries.length > 0) limitations.injuries = parsedInjuries;
    if (parsedMobility.length > 0) limitations.mobilityDifficulties = parsedMobility;
    if (Object.keys(limitations).length > 0) {
      preview.limitations = limitations;
    }

    if (currentRPE.trim()) preview.currentRPE = Number(currentRPE);
    if (naturalLanguageRequest.trim()) preview.naturalLanguageRequest = naturalLanguageRequest.trim();
    if (currentPlanMode === 'latest' && plan) {
      preview.currentPlan = '<using latest generated plan as context>';
    }
    if (currentPlanMode === 'manual') {
      const parsedSets = parseCurrentPlanSets(currentPlanExerciseSets);
      const parsedOverload = parseProgressiveOverload(currentPlanProgressiveOverload);
      const parsedWarmup = parseLines(currentPlanDayWarmup);
      const hasExercise = Boolean(currentPlanExerciseName.trim() && currentPlanExerciseEquipment.trim());

      const manualCurrentPlan: Record<string, unknown> = {
        planName: currentPlanName.trim(),
        primaryGoal: currentPlanPrimaryGoal,
        trainingLevel: currentPlanTrainingLevel,
        daysPerWeek: Number(currentPlanDaysPerWeek),
        durationWeeks: currentPlanDurationWeeks.trim() ? Number(currentPlanDurationWeeks) : null,
        rationale: currentPlanRationale.trim(),
        interSetRecoveryPolicy: currentPlanInterSetRecoveryPolicy.trim(),
        progressiveOverload: parsedOverload,
        days: [
          {
            dayLabel: currentPlanDayLabel.trim(),
            focus: currentPlanDayFocus.trim(),
            warmup: parsedWarmup,
            exercises: hasExercise
              ? [
                  {
                    exerciseName: currentPlanExerciseName.trim(),
                    equipment: currentPlanExerciseEquipment.trim(),
                    notes: currentPlanExerciseNotes.trim() || undefined,
                    sets: parsedSets,
                  },
                ]
              : [],
          },
        ],
      };
      preview.currentPlan =
        hasValidManualCurrentPlanForPreview(manualCurrentPlan)
          ? manualCurrentPlan
          : '<manual mode enabled; fill all required WorkoutPlan fields>';
    }

    return preview;
  }, [
    daysPerWeek,
    goal,
    customPrimaryGoal,
    trainingLevel,
    programDurationWeeks,
    equipmentAvailable,
    selectedGender,
    bodyWeight,
    height,
    age,
    trainingAge,
    injuries,
    mobilityDifficulties,
    currentRPE,
    naturalLanguageRequest,
    currentPlanMode,
    currentPlanName,
    currentPlanPrimaryGoal,
    currentPlanTrainingLevel,
    currentPlanDaysPerWeek,
    currentPlanDurationWeeks,
    currentPlanRationale,
    currentPlanInterSetRecoveryPolicy,
    currentPlanProgressiveOverload,
    currentPlanDayLabel,
    currentPlanDayFocus,
    currentPlanDayWarmup,
    currentPlanExerciseName,
    currentPlanExerciseEquipment,
    currentPlanExerciseNotes,
    currentPlanExerciseSets,
    plan,
  ]);

  const onGenerate = async () => {
    const parsedDays = Number(daysPerWeek);
    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 7) {
      setError('Days per week must be an integer between 1 and 7.');
      return;
    }

    const request: WorkoutRequest = {
      daysPerWeek: parsedDays,
      trainingLevel,
    };

    if (goal !== 'other') {
      request.primaryGoal = goal;
    } else if (!customPrimaryGoal.trim()) {
      setError('Please enter your custom primary goal when "Other" is selected.');
      return;
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
    if (bodyWeight.trim()) {
      const parsedBodyWeight = Number(bodyWeight);
      if (!Number.isFinite(parsedBodyWeight) || parsedBodyWeight < 1) {
        setError('Body weight must be a number greater than 0 when provided.');
        return;
      }
      demographics.bodyWeight = parsedBodyWeight;
    }
    if (height.trim()) {
      const parsedHeight = Number(height);
      if (!Number.isFinite(parsedHeight) || parsedHeight < 1) {
        setError('Height must be a number greater than 0 when provided.');
        return;
      }
      demographics.height = parsedHeight;
    }
    if (age.trim()) {
      const parsedAge = Number(age);
      if (!Number.isFinite(parsedAge) || parsedAge < 1) {
        setError('Age must be a number greater than 0 when provided.');
        return;
      }
      demographics.age = parsedAge;
    }
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
        nlParts.push(`Primary goal: ${customPrimaryGoal.trim()}`);
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

    if (currentPlanMode === 'manual') {
      const parsedCurrentPlanDays = Number(currentPlanDaysPerWeek);
      if (!Number.isInteger(parsedCurrentPlanDays) || parsedCurrentPlanDays < 1 || parsedCurrentPlanDays > 7) {
        setError('Current plan days per week must be an integer between 1 and 7.');
        return;
      }

      if (!currentPlanName.trim()) {
        setError('Current plan name is required when entering manual current plan details.');
        return;
      }

      if (!currentPlanRationale.trim()) {
        setError('Current plan rationale is required when entering manual current plan details.');
        return;
      }

      if (!currentPlanInterSetRecoveryPolicy.trim()) {
        setError('Current plan inter-set recovery policy is required when entering manual current plan details.');
        return;
      }

      if (!currentPlanDayLabel.trim() || !currentPlanDayFocus.trim()) {
        setError('Current plan day label and day focus are required.');
        return;
      }

      if (!currentPlanExerciseName.trim() || !currentPlanExerciseEquipment.trim()) {
        setError('Current plan exercise name and equipment are required.');
        return;
      }

      const parsedCurrentPlanDuration = currentPlanDurationWeeks.trim()
        ? Number(currentPlanDurationWeeks)
        : null;
      if (
        parsedCurrentPlanDuration !== null &&
        (!Number.isInteger(parsedCurrentPlanDuration) || parsedCurrentPlanDuration < 1)
      ) {
        setError('Current plan duration must be a positive integer when provided.');
        return;
      }

      const parsedOverload = parseProgressiveOverload(currentPlanProgressiveOverload);
      if (parsedOverload.length === 0) {
        setError('Add at least one progressive overload rule (one per line: ruleName: description).');
        return;
      }

      const parsedSetsResult = parseCurrentPlanSetsStrict(currentPlanExerciseSets);
      if (parsedSetsResult.error) {
        setError(parsedSetsResult.error);
        return;
      }
      const parsedSets = parsedSetsResult.sets;
      if (!parsedSets) {
        setError(
          'Add exercise sets in format: sets,weight,reps,rest,targetRpe (e.g. 3,80,10,90,8).',
        );
        return;
      }

      const manualCurrentPlan: WorkoutPlan = {
        planName: currentPlanName.trim(),
        primaryGoal: currentPlanPrimaryGoal,
        trainingLevel: currentPlanTrainingLevel,
        daysPerWeek: parsedCurrentPlanDays,
        durationWeeks: parsedCurrentPlanDuration,
        rationale: currentPlanRationale.trim(),
        interSetRecoveryPolicy: currentPlanInterSetRecoveryPolicy.trim(),
        progressiveOverload: parsedOverload,
        days: [
          {
            dayLabel: currentPlanDayLabel.trim(),
            focus: currentPlanDayFocus.trim(),
            warmup: parseLines(currentPlanDayWarmup),
            exercises: [
              {
                exerciseName: currentPlanExerciseName.trim(),
                equipment: currentPlanExerciseEquipment.trim(),
                notes: currentPlanExerciseNotes.trim() || undefined,
                sets: parsedSets,
              },
            ],
          },
        ],
      };

      if (manualCurrentPlan.days.length === 0 || manualCurrentPlan.days[0].exercises.length === 0) {
        setError('Current plan must include at least one day and one exercise.');
        return;
      }

      request.currentPlan = manualCurrentPlan;
    }

    console.debug('[app] submitting workout request', request);

    setLoading(true);
    setError(null);

    try {
      const accessToken = await secureStorage.getAccessToken();
      const generated = await generatePlan(
        { 
          apiBaseUrl: API_BASE_URL,
          endpointPath: API_ENDPOINT,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
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
      setError(e instanceof Error ? e.message : 'Failed to generate workout plan.');
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
              Workout Planner 🧠
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.80)">
              Generate custom AI-powered training plans
            </AppText>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <AppText variant="caption" style={styles.sectionLabel}>BASIC INFO</AppText>
          
          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Days per week</AppText>
          <TextInput
            value={daysPerWeek}
            onChangeText={setDaysPerWeek}
            keyboardType="number-pad"
            style={styles.input}
          />

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Primary goal</AppText>
          <View style={styles.row}>
            <Choice label="Strength" active={goal === 'strength'} onPress={() => setGoal('strength')} />
            <Choice
              label="Hypertrophy"
              active={goal === 'hypertrophy'}
              onPress={() => setGoal('hypertrophy')}
            />
            <Choice label="Other" active={goal === 'other'} onPress={() => setGoal('other')} />
          </View>
          {goal === 'other' ? (
            <TextInput
              value={customPrimaryGoal}
              onChangeText={setCustomPrimaryGoal}
              placeholder="Enter your primary goal"
              placeholderTextColor={WT.colors.textMuted}
              style={[styles.input, { marginTop: WT.spacing.xs }]}
            />
          ) : null}

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Training level</AppText>
          <View style={styles.row}>
            <Choice
              label="Beginner"
              active={trainingLevel === 'beginner'}
              onPress={() => setTrainingLevel('beginner')}
            />
            <Choice
              label="Intermediate"
              active={trainingLevel === 'intermediate'}
              onPress={() => setTrainingLevel('intermediate')}
            />
            <Choice
              label="Advanced"
              active={trainingLevel === 'advanced'}
              onPress={() => setTrainingLevel('advanced')}
            />
          </View>

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

          <View style={styles.divider} />

          <AppText variant="caption" style={styles.sectionLabel}>DEMOGRAPHICS (OPTIONAL)</AppText>
          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Gender</AppText>
          <View style={styles.row}>
            <Choice
              label="Not specified"
              active={genderOption === 'not_specified'}
              onPress={() => setGenderOption('not_specified')}
            />
            <Choice label="Male" active={genderOption === 'male'} onPress={() => setGenderOption('male')} />
            <Choice
              label="Female"
              active={genderOption === 'female'}
              onPress={() => setGenderOption('female')}
            />
          </View>

          <View style={styles.formRow}>
            <View style={{ flex: 1, marginRight: WT.spacing.sm }}>
              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Weight (kg)</AppText>
              <TextInput
                value={bodyWeight}
                onChangeText={setBodyWeight}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Height (cm)</AppText>
              <TextInput
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={{ flex: 1, marginRight: WT.spacing.sm }}>
              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Age</AppText>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Training Age</AppText>
              <TextInput
                value={trainingAge}
                onChangeText={setTrainingAge}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
          </View>

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
            <Choice
              label="Manual"
              active={currentPlanMode === 'manual'}
              onPress={() => setCurrentPlanMode('manual')}
            />
          </View>

          {currentPlanMode === 'manual' ? (
            <View style={styles.inlineSection}>
              <View style={styles.divider} />
              <AppText variant="caption" style={styles.sectionLabel}>MANUAL PLAN CONTEXT</AppText>
              
              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Plan Name</AppText>
              <TextInput
                value={currentPlanName}
                onChangeText={setCurrentPlanName}
                placeholder="Current plan name"
                placeholderTextColor={WT.colors.textMuted}
                style={styles.input}
              />

              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Goal</AppText>
              <View style={styles.row}>
                <Choice
                  label="Strength"
                  active={currentPlanPrimaryGoal === 'strength'}
                  onPress={() => setCurrentPlanPrimaryGoal('strength')}
                />
                <Choice
                  label="Hypertrophy"
                  active={currentPlanPrimaryGoal === 'hypertrophy'}
                  onPress={() => setCurrentPlanPrimaryGoal('hypertrophy')}
                />
                <Choice
                  label="Fitness"
                  active={currentPlanPrimaryGoal === 'general_fitness'}
                  onPress={() => setCurrentPlanPrimaryGoal('general_fitness')}
                />
              </View>

              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Days/Week</AppText>
              <TextInput
                value={currentPlanDaysPerWeek}
                onChangeText={setCurrentPlanDaysPerWeek}
                keyboardType="number-pad"
                style={styles.input}
              />

              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Progressive Overload</AppText>
              <AppText variant="caption" color={WT.colors.textMuted} style={{ marginBottom: 4 }}>
                ruleName: description (one per line)
              </AppText>
              <TextInput
                value={currentPlanProgressiveOverload}
                onChangeText={setCurrentPlanProgressiveOverload}
                placeholder={"Load: Add 2.5kg weekly if RPE <= 8"}
                placeholderTextColor={WT.colors.textMuted}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.multilineInput]}
              />

              <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Sample Exercise</AppText>
              <TextInput
                value={currentPlanExerciseName}
                onChangeText={setCurrentPlanExerciseName}
                placeholder="e.g. Back Squat"
                placeholderTextColor={WT.colors.textMuted}
                style={styles.input}
              />
              <TextInput
                value={currentPlanExerciseSets}
                onChangeText={setCurrentPlanExerciseSets}
                placeholder="sets,weight,reps,rest,targetRpe"
                placeholderTextColor={WT.colors.textMuted}
                style={styles.input}
              />
            </View>
          ) : null}

          <AppButton
            title={loading ? 'Thinking...' : 'Generate Plan ✨'}
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

        <View style={styles.card}>
          <AppText variant="caption" style={styles.sectionLabel}>REQUEST PREVIEW</AppText>
          <View style={styles.codeContainer}>
            <AppText style={styles.code}>{JSON.stringify(requestPreview, null, 2)}</AppText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <AppText variant="caption" style={styles.sectionLabel}>SERVER RESPONSE</AppText>
            {plan ? (
              <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
                <AppText variant="caption" bold color={WT.colors.primary}>
                  {copied ? 'Copied!' : 'Copy Plan'}
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.codeContainer}>
            <AppText style={styles.code}>
              {plan ? JSON.stringify(plan, null, 2) : 'No plan yet. Submit request to test end-to-end behavior.'}
            </AppText>
          </View>
        </View>
      </ScrollView>
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
  formRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: WT.colors.cardBorder,
    marginVertical: WT.spacing.lg,
    opacity: 0.5,
  },
  inlineSection: {
    marginTop: WT.spacing.sm,
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
  codeContainer: {
    backgroundColor: '#F8F9FB',
    borderRadius: WT.radius.sm,
    padding: WT.spacing.md,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
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

function parseLines(value: string): string[] {
  return value
    .split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

function resolveGenderValue(option: GenderOption): string | undefined {
  switch (option) {
    case 'male':
      return 'male';
    case 'female':
      return 'female';
    case 'not_specified':
    default:
      return undefined;
  }
}

function parseProgressiveOverload(value: string): WorkoutPlan['progressiveOverload'] {
  return parseLines(value)
    .map(line => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) {
        return null;
      }

      const ruleName = line.slice(0, separatorIndex).trim();
      const description = line.slice(separatorIndex + 1).trim();
      if (!ruleName || !description) {
        return null;
      }

      return { ruleName, description };
    })
    .filter((item): item is WorkoutPlan['progressiveOverload'][number] => Boolean(item));
}

function parseCurrentPlanSets(value: string): WorkoutPlan['days'][number]['exercises'][number]['sets'] {
  return parseCurrentPlanSetsStrict(value).sets!;
}

function parseCurrentPlanSetsStrict(value: string): {
  sets: WorkoutPlan['days'][number]['exercises'][number]['sets'] | null;
  error: string | null;
} {
  const line = value.trim();
  if (!line) {
    return { sets: null, error: null };
  }

  const parts = line.split(',').map(part => part.trim());
  if (parts.length !== 5) {
    return {
      sets: null,
      error: 'Use format: sets,weight,reps,rest,targetRpe (e.g. 3,80,10,90,8)',
    };
  }

  const sets = Number(parts[0]);
  const weight = Number(parts[1]);
  const reps = Number(parts[2]);
  const rest = Number(parts[3]);
  const targetRpe = Number(parts[4]);

  if (!Number.isInteger(sets) || sets < 1) {
    return { sets: null, error: 'sets must be an integer >= 1.' };
  }
  if (!Number.isFinite(weight) || weight < 0) {
    return { sets: null, error: 'weight must be a number >= 0 (0 for bodyweight).' };
  }
  if (!Number.isInteger(reps) || reps < 1 || reps > 30) {
    return { sets: null, error: 'reps must be an integer between 1 and 30.' };
  }
  if (!Number.isFinite(rest) || rest < 20 || rest > 360) {
    return { sets: null, error: 'rest must be a number between 20 and 360.' };
  }
  if (!Number.isFinite(targetRpe) || targetRpe < 5 || targetRpe > 10) {
    return { sets: null, error: 'targetRpe must be between 5 and 10.' };
  }

  return { sets: { sets, weight, reps, rest, targetRpe }, error: null };
}

function hasValidManualCurrentPlanForPreview(value: Record<string, unknown>): boolean {
  const planName = typeof value.planName === 'string' ? value.planName.trim() : '';
  const rationale = typeof value.rationale === 'string' ? value.rationale.trim() : '';
  const recovery =
    typeof value.interSetRecoveryPolicy === 'string' ? value.interSetRecoveryPolicy.trim() : '';
  const daysPerWeek = typeof value.daysPerWeek === 'number' ? value.daysPerWeek : NaN;

  const days = Array.isArray(value.days) ? value.days : [];
  const firstDay = days[0] as { dayLabel?: unknown; focus?: unknown; exercises?: unknown } | undefined;
  const dayLabel = typeof firstDay?.dayLabel === 'string' ? firstDay.dayLabel.trim() : '';
  const dayFocus = typeof firstDay?.focus === 'string' ? firstDay.focus.trim() : '';
  const firstExercise = Array.isArray(firstDay?.exercises)
    ? (firstDay?.exercises?.[0] as { exerciseName?: unknown; equipment?: unknown; sets?: unknown } | undefined)
    : undefined;
  const exerciseName = typeof firstExercise?.exerciseName === 'string' ? firstExercise.exerciseName.trim() : '';
  const equipment = typeof firstExercise?.equipment === 'string' ? firstExercise.equipment.trim() : '';
  const sets = firstExercise?.sets;

  const overload = Array.isArray(value.progressiveOverload) ? value.progressiveOverload : [];

  return (
    Boolean(planName) &&
    Number.isInteger(daysPerWeek) &&
    daysPerWeek >= 1 &&
    daysPerWeek <= 7 &&
    Boolean(rationale) &&
    Boolean(recovery) &&
    overload.length > 0 &&
    Boolean(dayLabel) &&
    Boolean(dayFocus) &&
    Boolean(exerciseName) &&
    Boolean(equipment) &&
    typeof sets === 'object' &&
    sets !== null
  );
}

export default WorkoutPlannerScreen;
