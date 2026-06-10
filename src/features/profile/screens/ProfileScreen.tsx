import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProfileStackParamList } from '../../../navigation/types';
import InfoRow from '../components/InfoRow';
import ProfileCard from '../components/ProfileCard';
import { PPT } from '../components/ProfileTheme';
import SettingsItem from '../components/SettingsItem';
import AppButton from '../../../components/AppButton';
import AppInput from '../../../components/AppInput';

import { useAuthStore } from '../../../store/authStore';
import { userApi, UserProfile } from '../../../services/api/user.api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    const logout = useAuthStore(s => s.logout);
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editPersonalInfoVisible, setEditPersonalInfoVisible] = useState(false);
    const [editData, setEditData] = useState({
        workoutPrimaryGoal: '',
        workoutTrainingLevel: '',
        workoutDaysPerWeek: '',
    });
    const [personalInfoData, setPersonalInfoData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        age: '',
        height: '',
        weight: '',
    });

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start();

        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const userProfile = await userApi.getProfile();
            setProfile(userProfile);
            setEditData({
                workoutPrimaryGoal: userProfile.workoutPrimaryGoal || '',
                workoutTrainingLevel: userProfile.workoutTrainingLevel || '',
                workoutDaysPerWeek: userProfile.workoutDaysPerWeek?.toString() || '',
            });
            setPersonalInfoData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                gender: userProfile.gender || '',
                age: userProfile.age?.toString() || '',
                height: userProfile.height?.toString() || '',
                weight: userProfile.weight?.toString() || '',
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWorkoutPreferences = async () => {
        try {
            setLoading(true);
            await userApi.updateProfile({
                workoutPrimaryGoal: editData.workoutPrimaryGoal,
                workoutTrainingLevel: editData.workoutTrainingLevel,
                workoutDaysPerWeek: editData.workoutDaysPerWeek ? parseInt(editData.workoutDaysPerWeek) : undefined,
            });
            await loadProfile();
            setEditModalVisible(false);
            Alert.alert('Success', 'Workout preferences updated!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePersonalInfo = async () => {
        try {
            setLoading(true);
            await userApi.updateProfile({
                firstName: personalInfoData.firstName,
                lastName: personalInfoData.lastName,
                gender: personalInfoData.gender as any,
                age: personalInfoData.age ? parseInt(personalInfoData.age) : undefined,
                height: personalInfoData.height ? parseFloat(personalInfoData.height) : undefined,
                weight: personalInfoData.weight ? parseFloat(personalInfoData.weight) : undefined,
            });
            await loadProfile();
            setEditPersonalInfoVisible(false);
            Alert.alert('Success', 'Personal info updated!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update personal info');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            // AppNavigator will automatically switch to the Auth stack
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

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
                            <Text style={styles.avatarLetter}>
                                {(profile?.firstName?.[0] || profile?.email?.[0] || '?').toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.userName}>
                            {profile ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'User' : 'Loading...'}
                        </Text>
                        <Text style={styles.userSub}>
                            {profile?.fitnessLevel 
                                ? profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1) 
                                : 'Fitness Enthusiast'}
                        </Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{profile?.weight ?? '--'}</Text>
                                <Text style={styles.statLabel}>Weight (kg)</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{profile?.height ?? '--'}</Text>
                                <Text style={styles.statLabel}>Height (cm)</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>-</Text>
                                <Text style={styles.statLabel}>Workouts</Text>
                            </View>
                        </View>
                    </ProfileCard>

                    {/* Personal Info */}
                    <ProfileCard>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Personal Info</Text>
                            <TouchableOpacity accessibilityRole="button" onPress={() => setEditPersonalInfoVisible(true)}>
                                <Text style={styles.editBtn}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                        <InfoRow label="Gender" value={profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '--'} />
                        <InfoRow label="Age" value={profile?.age ? `${profile.age} years` : '--'} />
                        <InfoRow label="Height" value={profile?.height ? `${profile.height} cm` : '--'} />
                        <InfoRow label="Weight" value={profile?.weight ? `${profile.weight} kg` : '--'} isLast />
                    </ProfileCard>

                    {/* Workout Preferences */}
                    {profile && (
                        <ProfileCard>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Workout Preferences</Text>
                                <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                                    <Text style={styles.editBtn}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                            {profile.workoutPrimaryGoal ? (
                                <>
                                    <InfoRow label="Primary Goal" value={profile.workoutPrimaryGoal} />
                                    <InfoRow label="Training Level" value={profile.workoutTrainingLevel || '-'} />
                                    <InfoRow label="Days Per Week" value={profile.workoutDaysPerWeek?.toString() || '-'} isLast />
                                </>
                            ) : (
                                <Text style={styles.noDataText}>No workout preferences set yet. Generate a plan to save your preferences.</Text>
                            )}
                        </ProfileCard>
                    )}

                    {/* Fitness Goal */}
                    <ProfileCard>
                        <Text style={styles.cardTitle}>Fitness Goal</Text>
                        <View style={styles.goalBadge}>
                            <Ionicons name="trophy-outline" size={18} color={PPT.accent} />
                            <Text style={styles.goalText}>
                                {profile?.fitnessGoals && profile.fitnessGoals.length > 0 
                                    ? profile.fitnessGoals.map(g => g.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
                                    : 'Build Strength Safely'}
                            </Text>
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

            {/* Edit Personal Info Modal */}
            <Modal
                visible={editPersonalInfoVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditPersonalInfoVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Personal Info</Text>
                            <TouchableOpacity onPress={() => setEditPersonalInfoVisible(false)}>
                                <Ionicons name="close" size={24} color={PPT.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <AppInput
                                label="First Name"
                                value={personalInfoData.firstName}
                                onChangeText={(text) => setPersonalInfoData({ ...personalInfoData, firstName: text })}
                                placeholder="Enter first name"
                            />
                            <AppInput
                                label="Last Name"
                                value={personalInfoData.lastName}
                                onChangeText={(text) => setPersonalInfoData({ ...personalInfoData, lastName: text })}
                                placeholder="Enter last name"
                            />
                            <AppInput
                                label="Gender"
                                value={personalInfoData.gender}
                                onChangeText={(text) => setPersonalInfoData({ ...personalInfoData, gender: text })}
                                placeholder="e.g., male, female, other"
                            />
                            <AppInput
                                label="Age"
                                value={personalInfoData.age}
                                onChangeText={(text) => setPersonalInfoData({ ...personalInfoData, age: text })}
                                placeholder="Enter age"
                                keyboardType="numeric"
                            />
                            <AppInput
                                label="Height (cm)"
                                value={personalInfoData.height}
                                onChangeText={(text) => setPersonalInfoData({ ...personalInfoData, height: text })}
                                placeholder="Enter height"
                                keyboardType="numeric"
                            />
                            <AppInput
                                label="Weight (kg)"
                                value={personalInfoData.weight}
                                onChangeText={(text) => setPersonalInfoData({ ...personalInfoData, weight: text })}
                                placeholder="Enter weight"
                                keyboardType="numeric"
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <AppButton
                                title="Save Profile"
                                onPress={handleSavePersonalInfo}
                                loading={loading}
                            />
                            <AppButton
                                title="Cancel"
                                onPress={() => setEditPersonalInfoVisible(false)}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>

            {/* Edit Workout Preferences Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Workout Preferences</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={PPT.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <AppInput
                                label="Primary Goal"
                                value={editData.workoutPrimaryGoal}
                                onChangeText={(text) => setEditData({ ...editData, workoutPrimaryGoal: text })}
                                placeholder="e.g., hypertrophy, strength, endurance"
                            />
                            <AppInput
                                label="Training Level"
                                value={editData.workoutTrainingLevel}
                                onChangeText={(text) => setEditData({ ...editData, workoutTrainingLevel: text })}
                                placeholder="e.g., beginner, intermediate, advanced"
                            />
                            <AppInput
                                label="Days Per Week"
                                value={editData.workoutDaysPerWeek}
                                onChangeText={(text) => setEditData({ ...editData, workoutDaysPerWeek: text })}
                                placeholder="e.g., 3, 4, 5"
                                keyboardType="numeric"
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <AppButton
                                title="Save Preferences"
                                onPress={handleSaveWorkoutPreferences}
                                loading={loading}
                            />
                            <AppButton
                                title="Cancel"
                                onPress={() => setEditModalVisible(false)}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
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

    noDataText: {
        fontSize: F.body,
        color: PPT.textSecondary,
        fontStyle: 'italic',
        paddingVertical: S.sm,
    },

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

    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: PPT.bgLight,
    },
    modalContent: {
        flex: 1,
        backgroundColor: PPT.bgLight,
        paddingHorizontal: S.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: S.md,
        borderBottomWidth: 1,
        borderBottomColor: PPT.cardBorder,
    },
    modalTitle: {
        fontSize: F.heading,
        fontWeight: '700',
        color: PPT.textPrimary,
    },
    modalBody: {
        flex: 1,
        paddingVertical: S.lg,
    },
    modalFooter: {
        paddingBottom: S.lg,
        borderTopWidth: 1,
        borderTopColor: PPT.cardBorder,
        paddingTop: S.md,
        gap: S.sm,
    },
});

export default ProfileScreen;
