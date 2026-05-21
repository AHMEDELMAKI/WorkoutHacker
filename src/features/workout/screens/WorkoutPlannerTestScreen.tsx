import type { WorkoutPlan, WorkoutRequest } from './src/planner-client';
import { generatePlan } from './src/planner-client';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LogBox,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

type Goal = 'strength' | 'hypertrophy' | 'other';
type Level = 'beginner' | 'intermediate' | 'advanced';
type PlanGoal = WorkoutPlan['primaryGoal'];
type GenderOption = 'not_specified' | 'male' | 'female';

const API_BASE_URL = 'http://localhost:3000';
let logRoutingInstalled = false;

function App() {
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
      const generated = await generatePlan({ apiBaseUrl: API_BASE_URL }, request);
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Workout Planner Demo</Text>
        <Text style={styles.subtitle}>React Native client hitting local server at {API_BASE_URL}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Days per week</Text>
          <TextInput
            value={daysPerWeek}
            onChangeText={setDaysPerWeek}
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Primary goal</Text>
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
              style={styles.input}
            />
          ) : null}

          <Text style={styles.label}>Training level</Text>
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

          <Text style={styles.label}>Program duration (weeks, optional)</Text>
          <TextInput
            value={programDurationWeeks}
            onChangeText={setProgramDurationWeeks}
            keyboardType="number-pad"
            placeholder="e.g. 8"
            style={styles.input}
          />

          <Text style={styles.label}>Equipment available (comma-separated)</Text>
          <TextInput
            value={equipmentAvailable}
            onChangeText={setEquipmentAvailable}
            placeholder="barbell, dumbbell, bodyweight"
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Demographics (optional)</Text>
          <Text style={styles.label}>Gender</Text>
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
          <Text style={styles.label}>Body weight (kg)</Text>
          <TextInput
            value={bodyWeight}
            onChangeText={setBodyWeight}
            keyboardType="decimal-pad"
            placeholder="Body weight (kg)"
            style={styles.input}
          />
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            placeholder="Height (cm)"
            style={styles.input}
          />
          <Text style={styles.label}>Age</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            placeholder="Age"
            style={styles.input}
          />
          <Text style={styles.label}>Training age (years)</Text>
          <TextInput
            value={trainingAge}
            onChangeText={setTrainingAge}
            keyboardType="decimal-pad"
            placeholder="Training age (years)"
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Limitations (optional)</Text>
          <Text style={styles.label}>Injuries</Text>
          <TextInput
            value={injuries}
            onChangeText={setInjuries}
            placeholder="Injuries (comma-separated)"
            style={styles.input}
          />
          <Text style={styles.label}>Mobility difficulties</Text>
          <TextInput
            value={mobilityDifficulties}
            onChangeText={setMobilityDifficulties}
            placeholder="Mobility difficulties (comma-separated)"
            style={styles.input}
          />

          <Text style={styles.label}>Current RPE (optional)</Text>
          <TextInput
            value={currentRPE}
            onChangeText={setCurrentRPE}
            keyboardType="decimal-pad"
            placeholder="1-10"
            style={styles.input}
          />

          <Text style={styles.label}>Natural language request (optional)</Text>
          <TextInput
            value={naturalLanguageRequest}
            onChangeText={setNaturalLanguageRequest}
            placeholder="I only have 45 minutes on weekdays..."
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.multilineInput]}
          />

          <Text style={styles.label}>Current plan context (optional)</Text>
          <Text style={styles.helpText}>
            Use your latest generated plan, or enter a simple summary of your current plan.
          </Text>
          <View style={styles.row}>
            <Choice
              label="Do not use"
              active={currentPlanMode === 'none'}
              onPress={() => setCurrentPlanMode('none')}
            />
            <Choice
              label="Use latest generated plan"
              active={currentPlanMode === 'latest'}
              onPress={() => setCurrentPlanMode('latest')}
            />
            <Choice
              label="Enter current plan details"
              active={currentPlanMode === 'manual'}
              onPress={() => setCurrentPlanMode('manual')}
            />
          </View>

          {currentPlanMode === 'manual' ? (
            <View style={styles.inlineSection}>
              <Text style={styles.label}>Current plan name</Text>
              <TextInput
                value={currentPlanName}
                onChangeText={setCurrentPlanName}
                placeholder="Current plan name"
                style={styles.input}
              />
              <Text style={styles.label}>Current plan primary goal</Text>
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
                  label="General fitness"
                  active={currentPlanPrimaryGoal === 'general_fitness'}
                  onPress={() => setCurrentPlanPrimaryGoal('general_fitness')}
                />
              </View>
              <Text style={styles.label}>Current plan training level</Text>
              <View style={styles.row}>
                <Choice
                  label="Beginner"
                  active={currentPlanTrainingLevel === 'beginner'}
                  onPress={() => setCurrentPlanTrainingLevel('beginner')}
                />
                <Choice
                  label="Intermediate"
                  active={currentPlanTrainingLevel === 'intermediate'}
                  onPress={() => setCurrentPlanTrainingLevel('intermediate')}
                />
                <Choice
                  label="Advanced"
                  active={currentPlanTrainingLevel === 'advanced'}
                  onPress={() => setCurrentPlanTrainingLevel('advanced')}
                />
              </View>
              <Text style={styles.label}>Current plan days/week</Text>
              <TextInput
                value={currentPlanDaysPerWeek}
                onChangeText={setCurrentPlanDaysPerWeek}
                keyboardType="number-pad"
                placeholder="Current plan days/week"
                style={styles.input}
              />
              <Text style={styles.label}>Current plan duration (weeks)</Text>
              <TextInput
                value={currentPlanDurationWeeks}
                onChangeText={setCurrentPlanDurationWeeks}
                keyboardType="number-pad"
                placeholder="Current plan duration (weeks)"
                style={styles.input}
              />
              <Text style={styles.label}>Current plan rationale</Text>
              <TextInput
                value={currentPlanRationale}
                onChangeText={setCurrentPlanRationale}
                placeholder="Why this plan exists"
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.multilineInput]}
              />
              <Text style={styles.label}>Inter-set recovery policy</Text>
              <TextInput
                value={currentPlanInterSetRecoveryPolicy}
                onChangeText={setCurrentPlanInterSetRecoveryPolicy}
                placeholder="e.g. 2-3 min compounds, 60-90 sec accessories"
                style={styles.input}
              />
              <Text style={styles.label}>Progressive overload rules</Text>
              <Text style={styles.helpText}>One per line: ruleName: description</Text>
              <TextInput
                value={currentPlanProgressiveOverload}
                onChangeText={setCurrentPlanProgressiveOverload}
                placeholder={"Load progression: Add 2.5kg weekly if RPE <= 8\nVolume progression: Add 1 set after week 2"}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.multilineInput]}
              />
              <Text style={styles.sectionTitle}>Current plan day</Text>
              <Text style={styles.label}>Day label</Text>
              <TextInput
                value={currentPlanDayLabel}
                onChangeText={setCurrentPlanDayLabel}
                placeholder="e.g. Day 1"
                style={styles.input}
              />
              <Text style={styles.label}>Day focus</Text>
              <TextInput
                value={currentPlanDayFocus}
                onChangeText={setCurrentPlanDayFocus}
                placeholder="e.g. Upper body strength"
                style={styles.input}
              />
              <Text style={styles.label}>Warmup</Text>
              <Text style={styles.helpText}>One warmup item per line</Text>
              <TextInput
                value={currentPlanDayWarmup}
                onChangeText={setCurrentPlanDayWarmup}
                placeholder={"5 min row\nband shoulder activation"}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.multilineInput]}
              />
              <Text style={styles.sectionTitle}>Current plan exercise</Text>
              <Text style={styles.label}>Exercise name</Text>
              <TextInput
                value={currentPlanExerciseName}
                onChangeText={setCurrentPlanExerciseName}
                placeholder="e.g. Back Squat"
                style={styles.input}
              />
              <Text style={styles.label}>Exercise equipment</Text>
              <TextInput
                value={currentPlanExerciseEquipment}
                onChangeText={setCurrentPlanExerciseEquipment}
                placeholder="e.g. barbell"
                style={styles.input}
              />
              <Text style={styles.label}>Exercise notes (optional)</Text>
              <TextInput
                value={currentPlanExerciseNotes}
                onChangeText={setCurrentPlanExerciseNotes}
                placeholder="Optional technique cues"
                style={styles.input}
              />
              <Text style={styles.label}>Exercise sets</Text>
              <Text style={styles.helpText}>Format: sets,weight,reps,rest,targetRpe (e.g. 3,80,10,90,8)</Text>
              <TextInput
                value={currentPlanExerciseSets}
                onChangeText={setCurrentPlanExerciseSets}
                placeholder={"3,80,10,90,8"}
                style={styles.input}
              />
            </View>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={onGenerate} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Thinking...' : 'Generate Plan'}</Text>
          </TouchableOpacity>

          {loading ? <ActivityIndicator style={styles.spinner} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Request preview</Text>
          <Text style={styles.code}>{JSON.stringify(requestPreview, null, 2)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Server response</Text>
            {plan ? (
              <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
                <Text style={styles.copyButtonText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.code}>
            {plan ? JSON.stringify(plan, null, 2) : 'No plan yet. Submit request to test end-to-end behavior.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.choice, active ? styles.choiceActive : null]} onPress={onPress}>
      <Text style={[styles.choiceText, active ? styles.choiceTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f2',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b3424',
  },
  subtitle: {
    fontSize: 14,
    color: '#3f5e49',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dce6dd',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b3424',
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '800',
    color: '#244b31',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c4d4c5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: '#15311f',
  },
  multilineInput: {
    minHeight: 80,
  },
  helpText: {
    marginTop: -2,
    fontSize: 12,
    color: '#3f5e49',
  },
  inlineSection: {
    gap: 8,
  },
  choice: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#8fae92',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceActive: {
    backgroundColor: '#1f6b3a',
    borderColor: '#1f6b3a',
  },
  choiceText: {
    color: '#1f6b3a',
    fontWeight: '600',
  },
  choiceTextActive: {
    color: '#ffffff',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#14522d',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  spinner: {
    marginTop: 8,
  },
  error: {
    marginTop: 8,
    color: '#9a1f1f',
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyButton: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1f6b3a',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  copyButtonText: {
    color: '#1f6b3a',
    fontSize: 12,
    fontWeight: '700',
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    color: '#273a2c',
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

export default App;
