import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProfileStackParamList } from '../../../navigation/types';
import ProfileCard from '../components/ProfileCard';
import { PPT } from '../components/ProfileTheme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PrivacySettings'>;

const PrivacySettingsScreen: React.FC<Props> = ({ navigation }) => {
    const [cameraAccess, setCameraAccess] = React.useState(true);
    const [cloudSync, setCloudSync] = React.useState(false);
    const [voiceCommands, setVoiceCommands] = React.useState(false);

    const { spacing: S, font: F } = PPT;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={PPT.bgPrimary} />

            {/* Header */}
            <View style={styles.headerBg}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            onPress={() => navigation?.goBack()}
                            style={styles.backBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                        >
                            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Settings</Text>
                        <View style={{ width: 38 }} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Privacy Controls */}
                <ProfileCard>
                    <Text style={styles.cardTitle}>Privacy Controls</Text>

                    {[
                        { label: 'Camera Access', value: cameraAccess, setter: setCameraAccess },
                        { label: 'Cloud Sync', value: cloudSync, setter: setCloudSync },
                        { label: 'Voice Commands', value: voiceCommands, setter: setVoiceCommands },
                    ].map((item, i, arr) => (
                        <React.Fragment key={item.label}>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>{item.label}</Text>
                                <Switch
                                    value={item.value}
                                    onValueChange={item.setter}
                                    trackColor={{ false: '#E0D6EC', true: PPT.bgPrimary }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                            {i < arr.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </ProfileCard>

                {/* Data Management */}
                <ProfileCard>
                    <Text style={styles.cardTitle}>Data Management</Text>
                    {[
                        { icon: 'download-outline' as const, label: 'Export Data', onPress: () => Alert.alert('Export', 'Export started. Your data will be ready shortly.') },
                        { icon: 'refresh-outline' as const, label: 'Reset Progress', onPress: () => Alert.alert('Reset Progress', 'Are you sure? This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Done', 'Progress reset.') }]) },
                    ].map((item, i, arr) => (
                        <React.Fragment key={item.label}>
                            <TouchableOpacity
                                style={styles.menuRow}
                                activeOpacity={0.7}
                                onPress={item.onPress}
                                accessibilityRole="button"
                            >
                                <View style={styles.menuIcon}>
                                    <Ionicons name={item.icon} size={18} color={PPT.accent} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={16} color={PPT.textSecondary} />
                            </TouchableOpacity>
                            {i < arr.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </ProfileCard>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    activeOpacity={0.82}
                    onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?')}
                    accessibilityRole="button"
                    accessibilityLabel="Logout"
                >
                    <Ionicons name="log-out-outline" size={18} color={PPT.danger} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: PPT.bgLight },
    headerBg: {
        backgroundColor: PPT.bgPrimary,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 24,
        paddingBottom: 24,
        elevation: 10,
        shadowColor: PPT.bgPrimary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.38,
        shadowRadius: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2,
    },
    scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
    cardTitle: {
        fontSize: 13, fontWeight: '700', color: PPT.textPrimary,
        marginBottom: 8, letterSpacing: 0.2,
    },
    switchRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 12,
    },
    switchLabel: { fontSize: 14, fontWeight: '600', color: PPT.textPrimary, flex: 1 },
    menuRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12, columnGap: 12,
    },
    menuIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: PPT.accentDim, alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: PPT.textPrimary },
    divider: { height: 1, backgroundColor: PPT.cardBorder },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: 52, borderRadius: 999, borderWidth: 1.5, borderColor: PPT.danger,
        columnGap: 8, marginTop: 4, marginBottom: 24,
    },
    logoutText: { fontSize: 14, fontWeight: '700', color: PPT.danger },
});

export default PrivacySettingsScreen;
