import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProfileStackParamList } from '../../../navigation/types';
import InfoRow from '../components/InfoRow';
import ProfileCard from '../components/ProfileCard';
import { PPT } from '../components/ProfileTheme';
import SettingsItem from '../components/SettingsItem';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start();
    }, []);

    // Navigate to auth – walk up two levels (ProfileStack → Main → Auth)
    const handleLogout = () =>
        (navigation.getParent()?.getParent() as any)?.replace('Auth');

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={PPT.bgPrimary} />

            {/* Violet header */}
            <View style={styles.headerBg}>
                <SafeAreaView edges={['top']}>
                    <Text style={styles.headerTitle}>Your Profile</Text>
                    <Text style={styles.headerSub}>Manage your account &amp; settings</Text>
                </SafeAreaView>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    {/* Avatar card */}
                    <ProfileCard style={styles.avatarCard}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarLetter}>J</Text>
                        </View>
                        <Text style={styles.userName}>John Doe</Text>
                        <Text style={styles.userSub}>Fitness Enthusiast</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>72</Text>
                                <Text style={styles.statLabel}>Weight (kg)</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>182</Text>
                                <Text style={styles.statLabel}>Height (cm)</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>24</Text>
                                <Text style={styles.statLabel}>Workouts</Text>
                            </View>
                        </View>
                    </ProfileCard>

                    {/* Personal Info */}
                    <ProfileCard>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Personal Info</Text>
                            <TouchableOpacity accessibilityRole="button">
                                <Text style={styles.editBtn}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                        <InfoRow label="Age" value="26 years" />
                        <InfoRow label="Height" value="182 cm" />
                        <InfoRow label="Weight" value="72 kg" isLast />
                    </ProfileCard>

                    {/* Fitness Goal */}
                    <ProfileCard>
                        <Text style={styles.cardTitle}>Fitness Goal</Text>
                        <View style={styles.goalBadge}>
                            <Ionicons name="trophy-outline" size={18} color={PPT.accent} />
                            <Text style={styles.goalText}>Build Strength Safely</Text>
                        </View>
                    </ProfileCard>

                    {/* Settings */}
                    <ProfileCard>
                        <Text style={styles.cardTitle}>Settings</Text>
                        <SettingsItem
                            icon="shield-checkmark-outline"
                            title="Privacy Controls"
                            onPress={() => navigation.navigate('PrivacySettings')}
                        />
                        <SettingsItem
                            icon="help-circle-outline"
                            title="Help & FAQ"
                            onPress={() => navigation.navigate('Help')}
                        />
                        <SettingsItem
                            icon="information-circle-outline"
                            title="About This App"
                            onPress={() => navigation.navigate('AboutApp')}
                            isLast
                        />
                    </ProfileCard>

                    {/* Logout */}
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                        activeOpacity={0.82}
                        accessibilityRole="button"
                        accessibilityLabel="Logout"
                    >
                        <Ionicons name="log-out-outline" size={18} color={PPT.danger} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const { spacing: S, radius: R, font: F } = PPT;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: PPT.bgLight },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: 40 },

    headerBg: {
        backgroundColor: PPT.bgPrimary,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        paddingHorizontal: S.lg, paddingBottom: S.xl,
        shadowColor: PPT.bgPrimary, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.40, shadowRadius: 16, elevation: 10,
    },
    headerTitle: {
        fontSize: 22, fontWeight: '800', color: PPT.textWhite,
        marginTop: S.sm, letterSpacing: 0.2,
    },
    headerSub: { fontSize: F.caption, color: PPT.textWhiteSoft, marginTop: 3, fontWeight: '400' },

    avatarCard: { alignItems: 'center', paddingTop: S.xl, paddingBottom: S.lg, marginTop: -S.lg },
    avatarCircle: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: PPT.bgPrimary, alignItems: 'center', justifyContent: 'center',
        marginBottom: S.sm, shadowColor: PPT.bgPrimary,
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.40, shadowRadius: 12, elevation: 8,
    },
    avatarLetter: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
    userName: { fontSize: F.heading, fontWeight: '800', color: PPT.textPrimary, marginBottom: 3 },
    userSub: { fontSize: F.caption, color: PPT.textSecondary, marginBottom: S.md, fontWeight: '500' },
    statsRow: {
        flexDirection: 'row', backgroundColor: PPT.bgLight,
        borderRadius: R.lg, paddingVertical: 12, paddingHorizontal: 4, width: '100%',
    },
    statItem: { flex: 1, alignItems: 'center', rowGap: 3 },
    statDivider: { width: 1, backgroundColor: PPT.cardBorder, marginVertical: 4 },
    statValue: { fontSize: 16, fontWeight: '800', color: PPT.textPrimary },
    statLabel: { fontSize: F.micro, color: PPT.textSecondary, fontWeight: '500' },

    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm,
    },
    cardTitle: {
        fontSize: F.label, fontWeight: '700', color: PPT.textPrimary,
        letterSpacing: 0.2, marginBottom: S.sm,
    },
    editBtn: { fontSize: F.micro, color: PPT.accent, fontWeight: '600' },

    goalBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: PPT.accentDim,
        borderRadius: R.full, paddingHorizontal: 16, paddingVertical: 10,
        columnGap: 8, alignSelf: 'flex-start', marginTop: 4,
    },
    goalText: { fontSize: F.body, fontWeight: '700', color: PPT.accent },

    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: PPT.buttonHeight, borderRadius: R.full,
        borderWidth: 1.5, borderColor: PPT.danger,
        columnGap: 8, marginBottom: S.lg,
    },
    logoutText: { fontSize: F.body, fontWeight: '700', color: PPT.danger },
});

export default ProfileScreen;
