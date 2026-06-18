import React, { useCallback, useEffect, useState } from 'react';
import {
  LogBox,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { WT } from '../../../theme/workoutTheme';
import { generatePlan } from '../../../lib/nutrition-planner';
import type { NutritionPlan, NutritionRequest } from '../../../lib/nutrition-planner';
import { userApi, UserProfile } from '../../../services/api/user.api';
import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';

type Goal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general_health' | 'other';
type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

const API_BASE_URL = 'https://64.226.123.63.nip.io';
const API_ENDPOINT = '/api/nutrition';
let logRoutingInstalled = false;

function NutritionPlannerScreen() {
  const [planDurationWeeks, setPlanDurationWeeks] = useState('');
  const [preferredFoods, setPreferredFoods] = useState('chicken breast, eggs, rice, oats, broccoli');
  const [mealsPerDay, setMealsPerDay] = useState('');
  const [allergies, setAllergies] = useState('');
  const [intolerances, setIntolerances] = useState('');
  const [dietType, setDietType] = useState('');
  const [currentCalorieIntake, setCurrentCalorieIntake] = useState('');
  const [naturalLanguageRequest, setNaturalLanguageRequest] = useState('');
  const [currentPlanMode, setCurrentPlanMode] = useState<'none' | 'latest'>('none');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const daysPerWeek = profile?.workoutDaysPerWeek ?? 4;
  const goal: Goal = (() => {
    const pg = profile?.workoutPrimaryGoal;
    if (pg === 'strength') return 'muscle_gain';
    if (pg === 'hypertrophy') return 'muscle_gain';
    return 'general_health';
  })();
  const activityLevel: ActivityLevel = (() => {
    const fl = profile?.fitnessLevel;
    if (fl === 'athlete' || fl === 'advanced') return 'very_active';
    if (fl === 'intermediate') return 'moderately_active';
    if (fl === 'beginner') return 'lightly_active';
    return 'moderately_active';
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
      const p = await userApi.getProfile();
      if (p) setProfile(p);
    } catch (err) {
      console.warn('[NutritionPlannerScreen] Failed to load profile:', err);
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

    const request: NutritionRequest = {
      daysPerWeek,
      activityLevel,
    };

    request.primaryGoal = goal;

    if (planDurationWeeks.trim()) {
      const parsedDuration = Number(planDurationWeeks);
      if (!Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 52) {
        setError('Plan duration must be an integer between 1 and 52 when provided.');
        return;
      }
      request.planDurationWeeks = parsedDuration;
    }

    const parsedFoods = parseList(preferredFoods);
    if (parsedFoods.length > 0) {
      request.preferredFoods = parsedFoods;
    }

    if (mealsPerDay.trim()) {
      const parsedMeals = Number(mealsPerDay);
      if (!Number.isInteger(parsedMeals) || parsedMeals < 1 || parsedMeals > 8) {
        setError('Meals per day must be an integer between 1 and 8.');
        return;
      }
      request.mealsPerDay = parsedMeals;
    }

    const demographics: NonNullable<NutritionRequest['demographics']> = {};
    if (selectedGender) demographics.gender = selectedGender;
    if (bodyWeight) demographics.bodyWeight = bodyWeight;
    if (heightInCm) demographics.height = heightInCm;
    if (ageInYears) demographics.age = ageInYears;
    if (Object.keys(demographics).length > 0) {
      request.demographics = demographics;
    }

    const restrictions: NonNullable<NutritionRequest['dietaryRestrictions']> = {};
    const parsedAllergies = parseList(allergies);
    const parsedIntolerances = parseList(intolerances);
    if (parsedAllergies.length > 0) restrictions.allergies = parsedAllergies;
    if (parsedIntolerances.length > 0) restrictions.intolerances = parsedIntolerances;
    if (dietType.trim()) restrictions.dietType = dietType.trim();
    if (Object.keys(restrictions).length > 0) {
      request.dietaryRestrictions = restrictions;
    }

    if (currentCalorieIntake.trim()) {
      const parsedCalories = Number(currentCalorieIntake);
      if (!Number.isFinite(parsedCalories) || parsedCalories < 100 || parsedCalories > 10000) {
        setError('Current calorie intake must be a number between 100 and 10000 when provided.');
        return;
      }
      request.currentCalorieIntake = parsedCalories;
    }

    if (naturalLanguageRequest.trim()) {
      request.naturalLanguageRequest = naturalLanguageRequest.trim();
    }

    if (currentPlanMode === 'latest') {
      if (!plan) {
        setError('Generate a plan first, then enable "Use latest generated plan".');
        return;
      }
      request.currentPlan = plan;
    }

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
      setPlan(generated);
    } catch (e) {
      setPlan(null);
      const msg = e instanceof Error ? e.message : '';
      if (msg.toLowerCase().includes('unauthorized')) {
        setApiKey('');
        setShowApiKeyModal(true);
      } else {
        setError(msg || 'Failed to generate nutrition plan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPlanHumanReadable = (p: NutritionPlan): string => {
    const lines: string[] = [];
    lines.push(`Nutrition Plan: ${p.planName}`);
    lines.push(`Primary Goal: ${p.primaryGoal}`);
    lines.push(`Activity Level: ${p.activityLevel}`);
    lines.push(`Days Per Week: ${p.daysPerWeek}`);
    lines.push(`Duration: ${p.durationWeeks ? `${p.durationWeeks} weeks` : 'Not specified'}`);
    lines.push('');
    lines.push(`Rationale: ${p.rationale}`);
    lines.push('');

    if (p.hydrationGuidelines.length > 0) {
      lines.push('Hydration Guidelines:');
      for (const rule of p.hydrationGuidelines) {
        lines.push(`  - ${rule.ruleName}: ${rule.description}`);
      }
      lines.push('');
    }

    if (p.progressionRules.length > 0) {
      lines.push('Progression Rules:');
      for (const rule of p.progressionRules) {
        lines.push(`  - ${rule.ruleName}: ${rule.description}`);
      }
      lines.push('');
    }

    for (const day of p.days) {
      lines.push(`Day ${day.dayLabel}: ${day.focus}`);
      const dt = day.dailyTotals;
      lines.push(`  Daily Totals: ${dt.calories} kcal | P: ${dt.proteinGrams}g | C: ${dt.carbsGrams}g | F: ${dt.fatGrams}g | Fiber: ${dt.fiberGrams}g`);
      for (const meal of day.meals) {
        const mm = meal.mealMacros;
        lines.push(`  ${meal.mealLabel} (${meal.mealTime}): ${mm.calories} kcal | P: ${mm.proteinGrams}g | C: ${mm.carbsGrams}g | F: ${mm.fatGrams}g`);
        for (const food of meal.foods) {
          lines.push(`    - ${food.foodName} (${food.portion})${food.notes ? ` — ${food.notes}` : ''}`);
          lines.push(`      ${food.macros.calories} kcal | P: ${food.macros.proteinGrams}g | C: ${food.macros.carbsGrams}g | F: ${food.macros.fatGrams}g | Fiber: ${food.macros.fiberGrams}g`);
        }
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
              Nutrition Planner
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.80)">
              Generate custom AI-powered meal plans
            </AppText>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <AppText variant="caption" style={styles.sectionLabel}>PROFILE</AppText>
          <View style={styles.profileSummary}>
            <AppText variant="bodySmall" color={WT.colors.textDark}>
              {daysPerWeek} days/week · {goal} · {activityLevel}
              {selectedGender ? ` · ${selectedGender}` : ''}
              {bodyWeight ? ` · ${bodyWeight}kg` : ''}
              {heightInCm ? ` · ${heightInCm}cm` : ''}
              {ageInYears ? ` · ${ageInYears}yo` : ''}
            </AppText>
          </View>

          <View style={styles.divider} />

          <AppText variant="caption" style={styles.sectionLabel}>MEAL PLAN SETTINGS</AppText>

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Plan duration (weeks, optional)</AppText>
          <TextInput
            value={planDurationWeeks}
            onChangeText={setPlanDurationWeeks}
            keyboardType="number-pad"
            placeholder="e.g. 8"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Meals per day</AppText>
          <TextInput
            value={mealsPerDay}
            onChangeText={setMealsPerDay}
            keyboardType="number-pad"
            placeholder="e.g. 4"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Preferred foods (comma-separated)</AppText>
          <TextInput
            value={preferredFoods}
            onChangeText={setPreferredFoods}
            placeholder="chicken breast, eggs, rice, oats"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <View style={styles.divider} />

          <AppText variant="caption" style={styles.sectionLabel}>DIETARY RESTRICTIONS (OPTIONAL)</AppText>
          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Allergies</AppText>
          <TextInput
            value={allergies}
            onChangeText={setAllergies}
            placeholder="Allergies (comma-separated)"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />
          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Intolerances</AppText>
          <TextInput
            value={intolerances}
            onChangeText={setIntolerances}
            placeholder="Intolerances (comma-separated)"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />
          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Diet type</AppText>
          <TextInput
            value={dietType}
            onChangeText={setDietType}
            placeholder="e.g. vegetarian, keto, mediterranean"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <View style={styles.divider} />

          <AppText variant="caption" style={styles.sectionLabel}>ADDITIONAL CONTEXT</AppText>

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Current calorie intake</AppText>
          <TextInput
            value={currentCalorieIntake}
            onChangeText={setCurrentCalorieIntake}
            keyboardType="decimal-pad"
            placeholder="100-10000"
            placeholderTextColor={WT.colors.textMuted}
            style={styles.input}
          />

          <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.fieldLabel}>Custom Request</AppText>
          <TextInput
            value={naturalLanguageRequest}
            onChangeText={setNaturalLanguageRequest}
            placeholder="I want high-protein meals under 30 min prep time..."
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
              Enter your API key to generate a nutrition plan.
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

export default NutritionPlannerScreen;
