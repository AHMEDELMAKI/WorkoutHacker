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
import type { Gender } from '../context/ProfileSetupContext';
import { useProfileSetup } from '../context/ProfileSetupContext';

type Props = ProfileSetupStackScreenProps<'Gender'>;

interface GenderOption {
    key: Gender;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
}

const OPTIONS: GenderOption[] = [
    { key: 'male', label: 'Male', icon: 'man-outline', description: 'Training plans tailored for men' },
    { key: 'female', label: 'Female', icon: 'woman-outline', description: 'Training plans tailored for women' },
];

const GenderCard: React.FC<{
    option: GenderOption;
    selected: boolean;
    onPress: () => void;
}> = ({ option, selected, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
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
                <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
                    <Ionicons
                        name={option.icon}
                        size={30}
                        color={selected ? T.bgPrimary : '#FFFFFF'}
                    />
                </View>
                <View style={styles.cardText}>
                    <Text style={styles.cardLabel}>{option.label}</Text>
                    <Text style={styles.cardDesc}>{option.description}</Text>
                </View>
                {selected && (
                    <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                )}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const GenderSelectionScreen: React.FC<Props> = ({ navigation }) => {
    const { profile, setGender } = useProfileSetup();

    return (
        <SetupWrapper
            step={1}
            title="Tell Us About You"
            subtitle="We'll personalize your experience based on your gender."
            canContinue={profile.gender !== null}
            onContinue={() => navigation.navigate('Age')}
        >
            <View style={styles.body}>
                {OPTIONS.map((opt) => (
                    <GenderCard
                        key={opt.key}
                        option={opt}
                        selected={profile.gender === opt.key}
                        onPress={() => setGender(opt.key)}
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
        paddingVertical: 18,
        columnGap: 14,
    },
    cardSelected: {
        backgroundColor: T.cardSelected,
        borderColor: T.cardSelectedBorder,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.30)',
    },
    iconCircleSelected: {
        backgroundColor: '#FFFFFF',
    },
    cardText: { flex: 1 },
    cardLabel: {
        fontSize: F.body,
        fontWeight: '700',
        color: T.textPrimary,
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: F.caption,
        color: T.textSecondary,
        lineHeight: 17,
    },
});

export default GenderSelectionScreen;
