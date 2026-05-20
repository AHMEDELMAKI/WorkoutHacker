import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../../workout/components/PrimaryWorkoutButton';

type Props = NativeStackScreenProps<RootStackParamList, 'FatigueCheck'>;

const FatigueCheckScreen: React.FC<Props> = ({ navigation }) => {
    const [started, setStarted] = useState(false);
    const [WorkoutFatigueSystem, setWorkoutFatigueSystem] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
        if (!started) return;

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
    }, [started]);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#1A0E2A" />
            <SafeAreaView style={styles.safe} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Fatigue Check</Text>
                    <Text style={styles.subtitle}>
                        Start the camera, flash, and sensors to estimate fatigue as a standalone check.
                    </Text>
                </View>

                <View style={styles.content}>
                    {!started ? (
                        <View style={styles.startCard}>
                            <Text style={styles.startTitle}>Ready to begin</Text>
                            <Text style={styles.startText}>
                                This will open the fatigue UI, activate the camera flash, and begin processing sensor data in small batches.
                            </Text>
                            <PrimaryWorkoutButton
                                label="Start Fatigue Calculation"
                                variant="purple"
                                onPress={() => setStarted(true)}
                            />
                        </View>
                    ) : CoreWiFiBridge ? (
                        <CoreWiFiBridge baseUrl="http://192.168.4.1" pollIntervalMs={50}>
                            {WorkoutFatigueSystem ? (
                                <WorkoutFatigueSystem hrMax={185} autoStart useTorch showControls={false} />
                            ) : (
                                <View style={styles.startCard}>
                                    <Text style={styles.startTitle}>Loading fatigue model...</Text>
                                </View>
                            )}
                        </CoreWiFiBridge>
                    ) : WorkoutFatigueSystem ? (
                        <WorkoutFatigueSystem hrMax={185} autoStart useTorch showControls={false} />
                    ) : (
                        <View style={styles.startCard}>
                            <Text style={styles.startTitle}>Loading fatigue model...</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <PrimaryWorkoutButton
                        label="Back to Home"
                        variant="white"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#1A0E2A' },
    safe: { flex: 1 },
    header: {
        paddingHorizontal: WT.spacing.lg,
        paddingTop: WT.spacing.md,
        paddingBottom: WT.spacing.sm,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: 'rgba(255,255,255,0.75)',
    },
    content: { flex: 1 },
    startCard: {
        marginHorizontal: WT.spacing.lg,
        marginTop: WT.spacing.lg,
        padding: WT.spacing.lg,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        gap: 14,
    },
    startTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
    },
    startText: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        paddingHorizontal: WT.spacing.lg,
        paddingVertical: WT.spacing.md,
    },
});

export default FatigueCheckScreen;
