import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import type { ProfileSetupStackScreenProps } from '../../../navigation/types';
import { SetupTheme as T } from '../components/SetupTheme';
import SetupWrapper from '../components/SetupWrapper';
import type { FitnessLevel } from '../context/ProfileSetupContext';
import { useProfileSetup } from '../context/ProfileSetupContext';

type Props = ProfileSetupStackScreenProps<'FitnessLevel'>;

interface LevelOption {
    key: FitnessLevel;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    sessions: string;
}

const LEVELS: LevelOption[] = [
    {
        key: 'beginner',
        label: 'Beginner',
        description: 'New to fitness or just getting started',
        icon: 'leaf-outline',
        sessions: '1–2x / week',
    },
    {
        key: 'intermediate',
        label: 'Intermediate',
        description: 'Working out regularly with some experience',
        icon: 'fitness-outline',
        sessions: '3–4x / week',
    },
    {
        key: 'advanced',
        label: 'Advanced',
        description: 'Experienced athlete with consistent training',
        icon: 'flash-outline',
        sessions: '5+ / week',
    },
    {
        key: 'athlete',
        label: 'Athlete',
        description: 'Competitive training at peak performance',
        icon: 'trophy-outline',
        sessions: 'Daily',
    },
];

const LevelCard: React.FC<{
    option: LevelOption;
    selected: boolean;
    onPress: () => void;
}> = ({ option, selected, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={() =>
                Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start()
            }
            onPressOut={() =>
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start()
            }
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
        >
            <Animated.View
                style={[
                    styles.card,
                    selected && styles.cardSelected,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                    <Ionicons
                        name={option.icon}
                        size={24}
                        color={selected ? T.bgPrimary : '#FFFFFF'}
                    />
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.cardLabel}>{option.label}</Text>
                    <Text style={styles.cardDesc}>{option.description}</Text>
                </View>
                <View style={[styles.sessionsTag, selected && styles.sessionsTagSelected]}>
                    <Text style={[styles.sessionsText, selected && styles.sessionsTextSelected]}>
                        {option.sessions}
                    </Text>
                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const FitnessLevelScreen: React.FC<Props> = ({ navigation }) => {
    const { profile, setFitnessLevel } = useProfileSetup();

    return (
        <SetupWrapper
            step={6}
            title="Your Fitness Level"
            subtitle="Be honest — this helps us create the right plan for you."
            onBack={() => navigation.goBack()}
            canContinue={profile.fitnessLevel !== null}
            onContinue={() => navigation.navigate('SetupComplete')}
        >
            <View style={styles.body}>
                {LEVELS.map((level) => (
                    <LevelCard
                        key={level.key}
                        option={level}
                        selected={profile.fitnessLevel === level.key}
                        onPress={() => setFitnessLevel(level.key)}
                    />
                ))}
            </View>
        </SetupWrapper>
    );
};

const { spacing: S, radius: R, font: F } = T;

const styles = StyleSheet.create({
    body: {
        flex: 1,
        paddingHorizontal: S.lg,
        paddingTop: S.lg,
        rowGap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: T.cardBg,
        borderRadius: R.lg,
        borderWidth: 1.5,
        borderColor: T.cardBorder,
        paddingHorizontal: S.md,
        paddingVertical: 16,
        columnGap: 14,
    },
    cardSelected: {
        backgroundColor: T.cardSelected,
        borderColor: T.cardSelectedBorder,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
    },
    iconWrapSelected: { backgroundColor: '#FFFFFF' },
    cardBody: { flex: 1 },
    cardLabel: {
        fontSize: F.body,
        fontWeight: '700',
        color: T.textPrimary,
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: F.caption,
        color: T.textSecondary,
        lineHeight: 16,
    },
    sessionsTag: {
        borderRadius: R.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.30)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    sessionsTagSelected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    sessionsText: {
        fontSize: F.caption,
        color: T.textSecondary,
        fontWeight: '600',
    },
    sessionsTextSelected: {
        color: T.bgPrimary,
    },
});

export default FitnessLevelScreen;
