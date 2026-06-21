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
type PlanDay = NutritionPlan['days'][number];
type PlanMeal = PlanDay['meals'][number];
type Macros = PlanDay['dailyTotals'];

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

  // --- Interactive plan viewer state ---
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [expandedMealKeys, setExpandedMealKeys] = useState<Set<string>>(new Set());
  const [showHydration, setShowHydration] = useState(false);
  const [showProgression, setShowProgression] = useState(false);

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

  // Reset the interactive viewer whenever a new plan comes in.
  useEffect(() => {
    if (plan) {
      setSelectedDayIndex(0);
      setExpandedMealKeys(new Set());
      setShowHydration(false);
      setShowProgression(false);
    }
  }, [plan]);

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

  const toggleMeal = useCallback((key: string) => {
    setExpandedMealKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

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

  const selectedDay = plan?.days[selectedDayIndex] ?? null;

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

            <AppText variant="h3" color={WT.colors.textDark} style={styles.planName}>
              {plan.planName}
            </AppText>
            <AppText variant="bodySmall" color={WT.colors.textMuted} style={styles.planMeta}>
              {plan.primaryGoal} · {plan.activityLevel} · {plan.daysPerWeek} days/week
              {plan.durationWeeks ? ` · ${plan.durationWeeks} wk plan` : ''}
            </AppText>
            <AppText variant="bodySmall" color={WT.colors.textDark} style={styles.rationale}>
              {plan.rationale}
            </AppText>

            {plan.hydrationGuidelines.length > 0 ? (
              <CollapsibleSection
                title={`Hydration Guidelines (${plan.hydrationGuidelines.length})`}
                expanded={showHydration}
                onToggle={() => setShowHydration(v => !v)}
              >
                {plan.hydrationGuidelines.map((rule, i) => (
                  <View key={i} style={styles.ruleRow}>
                    <AppText variant="bodySmall" bold color={WT.colors.textDark}>
                      {rule.ruleName}
                    </AppText>
                    <AppText variant="bodySmall" color={WT.colors.textMuted}>
                      {rule.description}
                    </AppText>
                  </View>
                ))}
              </CollapsibleSection>
            ) : null}

            {plan.progressionRules.length > 0 ? (
              <CollapsibleSection
                title={`Progression Rules (${plan.progressionRules.length})`}
                expanded={showProgression}
                onToggle={() => setShowProgression(v => !v)}
              >
                {plan.progressionRules.map((rule, i) => (
                  <View key={i} style={styles.ruleRow}>
                    <AppText variant="bodySmall" bold color={WT.colors.textDark}>
                      {rule.ruleName}
                    </AppText>
                    <AppText variant="bodySmall" color={WT.colors.textMuted}>
                      {rule.description}
                    </AppText>
                  </View>
                ))}
              </CollapsibleSection>
            ) : null}

            <View style={styles.divider} />

            <AppText variant="caption" style={styles.sectionLabel}>SELECT A DAY</AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dayTabsScroll}
              contentContainerStyle={styles.dayTabsContent}
            >
              {plan.days.map((day, idx) => (
                <DayTab
                  key={idx}
                  label={day.dayLabel}
                  calories={day.dailyTotals.calories}
                  active={selectedDayIndex === idx}
                  onPress={() => setSelectedDayIndex(idx)}
                />
              ))}
            </ScrollView>

            {selectedDay ? (
              <DayDetail
                day={selectedDay}
                dayIndex={selectedDayIndex}
                expandedMealKeys={expandedMealKeys}
                onToggleMeal={toggleMeal}
              />
            ) : null}
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

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity style={styles.collapsibleHeader} onPress={onToggle} activeOpacity={0.7}>
        <AppText variant="bodySmall" bold color={WT.colors.textDark}>
          {title}
        </AppText>
        <View style={styles.toggleBadge}>
          <AppText variant="bodySmall" bold color={WT.colors.primary}>
            {expanded ? '−' : '+'}
          </AppText>
        </View>
      </TouchableOpacity>
      {expanded ? <View style={styles.collapsibleBody}>{children}</View> : null}
    </View>
  );
}

function DayTab({
  label,
  calories,
  active,
  onPress,
}: {
  label: string;
  calories: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.dayTab, active ? styles.dayTabActive : null]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <AppText variant="bodySmall" bold color={active ? WT.colors.textLight : WT.colors.primary}>
        {label}
      </AppText>
      <AppText variant="caption" color={active ? 'rgba(255,255,255,0.85)' : WT.colors.textMuted}>
        {Math.round(calories)} kcal
      </AppText>
    </TouchableOpacity>
  );
}

function MacroChips({ macros }: { macros: Macros }) {
  const items: Array<{ value: string; label: string }> = [
    { value: `${Math.round(macros.calories)}`, label: 'kcal' },
    { value: `${Math.round(macros.proteinGrams)}g`, label: 'protein' },
    { value: `${Math.round(macros.carbsGrams)}g`, label: 'carbs' },
    { value: `${Math.round(macros.fatGrams)}g`, label: 'fat' },
  ];
  if (typeof macros.fiberGrams === 'number') {
    items.push({ value: `${Math.round(macros.fiberGrams)}g`, label: 'fiber' });
  }

  return (
    <View style={styles.macroChipsRow}>
      {items.map((item, i) => (
        <View key={i} style={styles.macroChip}>
          <AppText variant="caption" bold color={WT.colors.textDark}>
            {item.value}
          </AppText>
          <AppText variant="caption" color={WT.colors.textMuted}>
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function MealCard({
  meal,
  mealKey,
  expanded,
  onToggle,
}: {
  meal: PlanMeal;
  mealKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <View style={styles.mealCard}>
      <TouchableOpacity
        style={styles.mealHeader}
        onPress={() => onToggle(mealKey)}
        activeOpacity={0.7}
      >
        <View style={styles.mealHeaderText}>
          <AppText variant="bodySmall" bold color={WT.colors.textDark}>
            {meal.mealLabel}
          </AppText>
          <AppText variant="caption" color={WT.colors.textMuted}>
            {meal.mealTime} · {Math.round(meal.mealMacros.calories)} kcal · {meal.foods.length} item
            {meal.foods.length === 1 ? '' : 's'}
          </AppText>
        </View>
        <View style={styles.toggleBadge}>
          <AppText variant="bodySmall" bold color={WT.colors.primary}>
            {expanded ? '−' : '+'}
          </AppText>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.mealBody}>
          <MacroChips macros={meal.mealMacros} />
          {meal.foods.map((food, foodIdx) => (
            <View
              key={foodIdx}
              style={[
                styles.foodRow,
                foodIdx === meal.foods.length - 1 ? styles.foodRowLast : null,
              ]}
            >
              <View style={styles.foodRowText}>
                <AppText variant="bodySmall" bold color={WT.colors.textDark}>
                  {food.foodName}
                </AppText>
                <AppText variant="caption" color={WT.colors.textMuted}>
                  {food.portion}
                  {food.notes ? ` · ${food.notes}` : ''}
                </AppText>
              </View>
              <AppText variant="caption" color={WT.colors.textMuted}>
                {Math.round(food.macros.calories)} kcal
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function DayDetail({
  day,
  dayIndex,
  expandedMealKeys,
  onToggleMeal,
}: {
  day: PlanDay;
  dayIndex: number;
  expandedMealKeys: Set<string>;
  onToggleMeal: (key: string) => void;
}) {
  return (
    <View style={styles.dayDetail}>
      <AppText variant="bodySmall" bold color={WT.colors.textDark} style={styles.dayFocus}>
        {day.focus}
      </AppText>
      <MacroChips macros={day.dailyTotals} />

      <View style={styles.mealsList}>
        {day.meals.map((meal, mealIdx) => {
          const key = `${dayIndex}-${mealIdx}`;
          return (
            <MealCard
              key={key}
              meal={meal}
              mealKey={key}
              expanded={expandedMealKeys.has(key)}
              onToggle={onToggleMeal}
            />
          );
        })}
      </View>
    </View>
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

  // --- Plan overview ---
  planName: {
    fontWeight: '800',
    marginBottom: 2,
  },
  planMeta: {
    marginBottom: WT.spacing.sm,
  },
  rationale: {
    marginBottom: WT.spacing.sm,
    lineHeight: 20,
  },

  // --- Collapsible sections (hydration / progression) ---
  collapsibleSection: {
    borderRadius: WT.radius.sm,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    marginTop: WT.spacing.sm,
    overflow: 'hidden',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: WT.spacing.md,
    paddingVertical: WT.spacing.sm,
    backgroundColor: '#F8F9FB',
  },
  collapsibleBody: {
    paddingHorizontal: WT.spacing.md,
    paddingVertical: WT.spacing.sm,
  },
  ruleRow: {
    marginBottom: WT.spacing.sm,
  },
  toggleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: WT.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Day tabs ---
  dayTabsScroll: {
    marginBottom: WT.spacing.md,
  },
  dayTabsContent: {
    gap: WT.spacing.xs,
    paddingRight: WT.spacing.sm,
  },
  dayTab: {
    minWidth: 84,
    alignItems: 'center',
    borderRadius: WT.radius.sm,
    borderWidth: 1,
    borderColor: WT.colors.primary,
    backgroundColor: '#FFF',
    paddingVertical: WT.spacing.sm,
    paddingHorizontal: WT.spacing.md,
  },
  dayTabActive: {
    backgroundColor: WT.colors.primary,
  },

  // --- Day detail ---
  dayDetail: {
    backgroundColor: '#F8F9FB',
    borderRadius: WT.radius.sm,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    padding: WT.spacing.md,
  },
  dayFocus: {
    marginBottom: WT.spacing.sm,
  },
  macroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WT.spacing.xs,
    marginBottom: WT.spacing.sm,
  },
  macroChip: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    borderRadius: WT.radius.sm,
    paddingHorizontal: WT.spacing.sm,
    paddingVertical: 6,
    minWidth: 56,
  },
  mealsList: {
    gap: WT.spacing.sm,
  },

  // --- Meal cards ---
  mealCard: {
    backgroundColor: '#FFF',
    borderRadius: WT.radius.sm,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: WT.spacing.md,
    paddingVertical: WT.spacing.sm,
  },
  mealHeaderText: {
    flex: 1,
    paddingRight: WT.spacing.sm,
  },
  mealBody: {
    paddingHorizontal: WT.spacing.md,
    paddingBottom: WT.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: WT.colors.cardBorder,
    paddingTop: WT.spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: WT.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: WT.colors.cardBorder,
  },
  foodRowLast: {
    borderBottomWidth: 0,
  },
  foodRowText: {
    flex: 1,
    paddingRight: WT.spacing.sm,
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