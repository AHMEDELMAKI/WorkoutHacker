import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FatigueCheckStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../../workout/components/PrimaryWorkoutButton';
import { useFatigueCheck } from '../context/FatigueCheckContext';

type Props = NativeStackScreenProps<FatigueCheckStackParamList, 'FatigueLanding'>;

const FatigueLandingScreen: React.FC<Props> = ({ navigation }) => {
  const { resetSession } = useFatigueCheck();

  const handleStart = () => {
    resetSession();
    navigation.navigate('FatigueHeartRate');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.background} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.heroCard}>
              <Text style={styles.eyebrow}>Standalone fatigue check</Text>
              <Text style={styles.title}>Measure before you decide to push or rest.</Text>
              <Text style={styles.subtitle}>
                We will measure your heart rate first, then collect EMG and velocity data, and finally
                show whether you should continue your activity or rest longer.
              </Text>
            </View>

            <View style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>What happens next</Text>
              <Text style={styles.stepText}>
                1. Lock a stable heart-rate reading with the back camera and flash.
              </Text>
              <Text style={styles.stepText}>
                2. Receive at least 2 EMG windows and 3 smooth movement reps for velocity.
              </Text>
              <Text style={styles.stepText}>3. Run the fatigue check and show your recommendation.</Text>
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
  },
  eyebrow: {
    color: WT.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: WT.colors.textDark,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: WT.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  stepsCard: {
    padding: WT.spacing.lg,
    borderRadius: WT.radius.md,
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    gap: 12,
  },
  stepsTitle: {
    color: WT.colors.textDark,
    fontSize: 18,
    fontWeight: '800',
  },
  stepText: {
    color: WT.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: WT.spacing.lg,
    paddingVertical: WT.spacing.md,
  },
  footerSpacer: {
    height: WT.spacing.sm,
  },
});

export default FatigueLandingScreen;
