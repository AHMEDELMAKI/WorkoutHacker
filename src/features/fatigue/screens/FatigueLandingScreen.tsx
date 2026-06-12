import Ionicons from 'react-native-vector-icons/Ionicons';
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
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      
      {/* HEADER SECTION */}
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
                We will measure your heart rate first, then collect EMG and velocity data, and finally
                show whether you should continue your activity or rest longer.
              </Text>
            </View>

            <View style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>What happens next</Text>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                <Text style={styles.stepText}>Lock heart-rate with the camera.</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                <Text style={styles.stepText}>Collect EMG and movement data.</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
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
