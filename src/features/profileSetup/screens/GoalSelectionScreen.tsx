import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import type { ProfileSetupStackScreenProps } from '../../../navigation/types';
import { SetupTheme as T } from '../components/SetupTheme';
import SetupWrapper from '../components/SetupWrapper';
import type { Goal } from '../context/ProfileSetupContext';
import { useProfileSetup } from '../context/ProfileSetupContext';

type Props = ProfileSetupStackScreenProps<'Goals'>;

interface GoalOption {
    key: Goal;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const GOALS: GoalOption[] = [
    {
        key: 'lose_weight',
        label: 'Lose Weight',
        description: 'Burn calories and reduce body fat',
        icon: 'flame-outline',
    },
    {
        key: 'build_muscle',
        label: 'Build Muscle',
        description: 'Gain strength and muscle mass',
        icon: 'barbell-outline',
    },
    {
        key: 'improve_endurance',
        label: 'Improve Endurance',
        description: 'Build stamina for long workouts',
        icon: 'bicycle-outline',
    },
    {
        key: 'stay_healthy',
        label: 'Stay Healthy',
        description: 'Maintain fitness and overall wellness',
        icon: 'heart-outline',
    },
    {
        key: 'athletic_performance',
        label: 'Athletic Performance',
        description: 'Train like an athlete and peak performance',
        icon: 'trophy-outline',
    },
];

const GoalCard: React.FC<{
    option: GoalOption;
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
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
        >
            <Animated.View
                style={[
                    styles.card,
                    selected && styles.cardSelected,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
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
                {selected && (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                )}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const GoalSelectionScreen: React.FC<Props> = ({ navigation }) => {
    const { profile, toggleGoal } = useProfileSetup();

    return (
        <SetupWrapper
            step={5}
            title="What Are Your Goals?"
            subtitle="Select one or more goals. We'll tailor your workouts accordingly."
            onBack={() => navigation.goBack()}
            canContinue={profile.goals.length > 0}
            onContinue={() => navigation.navigate('FitnessLevel')}
            scrollable
        >
            <View style={styles.body}>
                {GOALS.map((opt) => (
                    <GoalCard
                        key={opt.key}
                        option={opt}
                        selected={profile.goals.includes(opt.key)}
                        onPress={() => toggleGoal(opt.key)}
                    />
                ))}
            </View>
        </SetupWrapper>
    );
};

const { spacing: S, radius: R, font: F } = T;

const styles = StyleSheet.create({
    body: {
        paddingHorizontal: S.lg,
        paddingTop: S.lg,
        paddingBottom: S.lg,
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
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
    },
    iconCircleSelected: {
        backgroundColor: '#FFFFFF',
    },
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
});

export default GoalSelectionScreen;
