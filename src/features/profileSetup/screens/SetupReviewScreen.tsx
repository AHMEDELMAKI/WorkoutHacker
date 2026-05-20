import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ProfileSetupStackScreenProps } from '../../../navigation/types';
import { SetupTheme as T } from '../components/SetupTheme';
import { useProfileSetup } from '../context/ProfileSetupContext';
import { userApi } from '../../../services/api/user.api';
import { useAuthStore } from '../../../store/authStore';
import { Alert } from 'react-native';

type Props = ProfileSetupStackScreenProps<'SetupComplete'>;

const GOAL_LABELS: Record<string, string> = {
    lose_weight: 'Lose Weight',
    build_muscle: 'Build Muscle',
    improve_endurance: 'Improve Endurance',
    stay_healthy: 'Stay Healthy',
    athletic_performance: 'Athletic Performance',
};

const LEVEL_LABELS: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    athlete: 'Athlete',
};

const GENDER_LABELS: Record<string, string> = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
};

interface ReviewRowProps {
    icon: any; // Using any to avoid glyphMap version mismatch
    label: string;
    value: string;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ icon, label, value }) => (
    <View style={styles.row}>
        <View style={styles.rowIconWrap}>
            <Ionicons name={icon} size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
    </View>
);

const SetupReviewScreen: React.FC<Props> = ({ navigation }) => {
    const { profile } = useProfileSetup();
    const insets = useSafeAreaInsets();

    // Success animation on mount
    const scaleAnim = useRef(new Animated.Value(0.7)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [loading, setLoading] = React.useState(false);
    const refreshUser = useAuthStore(s => s.refreshUser);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleStartTraining = async () => {
        setLoading(true);
        try {
            // 1. Persist profile to backend
            await userApi.updateProfile({
                gender: profile.gender?.toUpperCase() as any,
                ageYears: profile.age,
                heightCm: profile.heightCm,
                weightKg: profile.weightKg,
                fitnessLevel: profile.fitnessLevel?.toUpperCase() as any,
                fitnessGoals: profile.goals,
                onboardingDone: true,
            });

            // 2. Persist privacy settings
            await userApi.updatePrivacy({
                localOnly: profile.privacyLocalOnly,
                shareAnalytics: profile.privacyShareAnalytics,
                cameraAccess: profile.privacyCameraAccess,
            });

            // 3. Refresh global auth state to reflect onboarding completion
            await refreshUser();

            // 4. Navigate to main app
            navigation.getParent()?.navigate('Main');
        } catch (err: any) {
            Alert.alert('Setup Failed', err.message || 'Could not save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const totalInches = profile.heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    const lbs = Math.round(profile.weightKg * 2.2046);

    return (
        <View style={styles.root}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) + 100 },
                ]}
            >
                {/* Header */}
                <Animated.View style={[styles.headerWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark-circle" size={56} color="#FFFFFF" />
                    </View>
                    <Text style={styles.congrats}>You're All Set!</Text>
                    <Text style={styles.subCongrats}>
                        Here's your profile summary. You can always update this later.
                    </Text>
                </Animated.View>

                {/* Review Card */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <ReviewRow icon="person-outline" label="Gender" value={GENDER_LABELS[profile.gender ?? ''] ?? '—'} />
                    <View style={styles.sep} />
                    <ReviewRow icon="calendar-outline" label="Age" value={`${profile.age} yrs`} />
                    <View style={styles.sep} />
                    <ReviewRow
                        icon="resize-outline"
                        label="Height"
                        value={`${profile.heightCm} cm (${feet}'${inches}")`}
                    />
                    <View style={styles.sep} />
                    <ReviewRow
                        icon="scale-outline"
                        label="Weight"
                        value={`${profile.weightKg} kg (${lbs} lbs)`}
                    />
                    <View style={styles.sep} />
                    <ReviewRow
                        icon="flag-outline"
                        label="Goals"
                        value={
                            profile.goals.length > 0
                                ? profile.goals.map((g) => GOAL_LABELS[g]).join(', ')
                                : '—'
                        }
                    />
                    <View style={styles.sep} />
                    <ReviewRow
                        icon="flash-outline"
                        label="Level"
                        value={LEVEL_LABELS[profile.fitnessLevel ?? ''] ?? '—'}
                    />
                </Animated.View>
            </ScrollView>

            {/* Sticky footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity
                    onPress={handleStartTraining}
                    style={[styles.startBtn, loading && { opacity: 0.7 }]}
                    disabled={loading}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Start Training"
                >
                    {loading ? (
                        <Text style={styles.startBtnText}>Saving...</Text>
                    ) : (
                        <>
                            <Ionicons name="barbell-outline" size={20} color={T.bgPrimary} />
                            <Text style={styles.startBtnText}>Start Training</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.editBtn}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Edit Profile"
                >
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const { spacing: S, radius: R, font: F } = T;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: T.bgPrimary,
    },
    scrollContent: {
        paddingHorizontal: S.lg,
        rowGap: S.lg,
    },

    // Header
    headerWrap: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    checkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.20)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.38)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.20,
        shadowRadius: 20,
        elevation: 0,
    },
    congrats: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    subCongrats: {
        fontSize: F.subtitle,
        color: T.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
    },

    // Review card
    card: {
        backgroundColor: T.cardBg,
        borderRadius: R.xl,
        borderWidth: 1.5,
        borderColor: T.cardBorder,
        paddingHorizontal: S.lg,
        paddingVertical: S.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        columnGap: 12,
    },
    rowIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        flex: 1,
        fontSize: F.label,
        color: T.textSecondary,
        fontWeight: '500',
    },
    rowValue: {
        fontSize: F.label,
        color: '#FFFFFF',
        fontWeight: '700',
        textAlign: 'right',
        maxWidth: 180,
    },
    sep: {
        height: 1,
        backgroundColor: T.divider,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: S.lg,
        paddingTop: S.md,
        rowGap: 10,
        backgroundColor: T.bgPrimary,
        borderTopWidth: 1,
        borderTopColor: T.divider,
    },
    startBtn: {
        flexDirection: 'row',
        height: T.buttonHeight,
        backgroundColor: '#FFFFFF',
        borderRadius: R.xl,
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 10,
        shadowColor: T.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 10,
        elevation: 5,
    },
    startBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: T.bgPrimary,
        letterSpacing: 0.3,
    },
    editBtn: {
        height: T.buttonHeight,
        borderRadius: R.xl,
        borderWidth: 1.5,
        borderColor: T.btnOutlineBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default SetupReviewScreen;
