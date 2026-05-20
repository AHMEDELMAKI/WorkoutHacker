import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WorkoutStackParamList } from '../../../navigation/types';
import PrimaryWorkoutButton from '../components/PrimaryWorkoutButton';
import { WT } from '../../../theme/workoutTheme';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'HeartRateFatigue'>;

const HeartRateFatigueScreen: React.FC<Props> = ({ route, navigation }) => {
  const { workoutType } = route.params;
  const [WorkoutFatigueSystem, setWorkoutFatigueSystem] = React.useState<React.ComponentType<any> | null>(null);
  const [CoreWiFiBridge, setCoreWiFiBridge] = React.useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      import('../../../../Fatigue-with-HeartRate-main/src/react-native'),
      import('../../../../ESP-connection-main/src'),
    ])
      .then(([fatigueModule, coreModule]) => {
        if (!mounted) return;
        setWorkoutFatigueSystem(() => fatigueModule.WorkoutFatigueSystem ?? fatigueModule.default ?? null);
        setCoreWiFiBridge(() => coreModule.WiFiSensorBridge ?? coreModule.default ?? null);
      })
      .catch((error) => {
        console.error('Failed to load WorkoutFatigueSystem or core bridge', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.content}>
        {CoreWiFiBridge ? (
          <CoreWiFiBridge baseUrl="http://192.168.4.1" pollIntervalMs={50}>
            {WorkoutFatigueSystem ? <WorkoutFatigueSystem hrMax={185} autoStart useTorch debug /> : null}
          </CoreWiFiBridge>
        ) : WorkoutFatigueSystem ? (
          <WorkoutFatigueSystem hrMax={185} autoStart useTorch debug />
        ) : null}
      </View>
      <View style={styles.footer}>
        <PrimaryWorkoutButton
          label="Continue"
          variant="white"
          onPress={() => navigation.replace('WorkoutComplete', { workoutType })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A0E2A' },
  content: { flex: 1 },
  footer: {
    paddingHorizontal: WT.spacing.lg,
    paddingVertical: WT.spacing.md,
  },
});

export default HeartRateFatigueScreen;