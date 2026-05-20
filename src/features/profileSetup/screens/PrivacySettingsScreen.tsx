import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import type { ProfileSetupStackScreenProps } from '../../../navigation/types';
import { SetupTheme as T } from '../components/SetupTheme';
import SetupWrapper from '../components/SetupWrapper';
import type { ProfileSetupState } from '../context/ProfileSetupContext';
import { useProfileSetup } from '../context/ProfileSetupContext';

type Props = ProfileSetupStackScreenProps<any>;

type PrivacyKey = keyof Pick<
    ProfileSetupState,
    'privacyCameraAccess' | 'privacyLocalOnly' | 'privacyShareAnalytics'
>;

interface Setting {
    key: PrivacyKey;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const SETTINGS: Setting[] = [
    {
        key: 'privacyCameraAccess',
        label: 'Camera Access',
        description: 'Used for scanning food barcodes and progress photos',
        icon: 'camera-outline',
    },
    {
        key: 'privacyLocalOnly',
        label: 'Local Data Only',
        description: 'Store your data only on this device, not in the cloud',
        icon: 'phone-portrait-outline',
    },
    {
        key: 'privacyShareAnalytics',
        label: 'Share Analytics',
        description: 'Help us improve the app by sharing usage statistics',
        icon: 'bar-chart-outline',
    },
];

const PrivacySettingsScreen: React.FC<Props> = ({ navigation }) => {
    const { profile, setPrivacy } = useProfileSetup();

    return (
        <SetupWrapper
            step={7}
            title="Privacy Settings"
            subtitle="Control how we use your data. You can change these anytime."
            onBack={() => navigation.goBack()}
            onContinue={() => navigation.navigate('SetupComplete')}
        >
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {SETTINGS.map((setting) => (
                    <View key={setting.key} style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Ionicons name={setting.icon} size={22} color="#FFFFFF" />
                        </View>
                        <View style={styles.textBlock}>
                            <Text style={styles.label}>{setting.label}</Text>
                            <Text style={styles.desc}>{setting.description}</Text>
                        </View>
                        <Switch
                            value={profile[setting.key]}
                            onValueChange={(val) => setPrivacy(setting.key, val)}
                            trackColor={{ false: 'rgba(255,255,255,0.25)', true: '#FFFFFF' }}
                            thumbColor={
                                Platform.OS === 'android'
                                    ? profile[setting.key]
                                        ? T.bgPrimary
                                        : 'rgba(255,255,255,0.70)'
                                    : '#FFFFFF'
                            }
                            ios_backgroundColor="rgba(255,255,255,0.25)"
                            accessibilityLabel={setting.label}
                        />
                    </View>
                ))}

                <View style={styles.noteCard}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={T.textSecondary} />
                    <Text style={styles.noteText}>
                        Your data is always kept private and will never be sold to third parties.
                    </Text>
                </View>
            </ScrollView>
        </SetupWrapper>
    );
};

const { spacing: S, radius: R, font: F } = T;

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
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
        paddingVertical: 14,
        columnGap: 14,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
    },
    textBlock: { flex: 1 },
    label: {
        fontSize: F.body,
        fontWeight: '700',
        color: T.textPrimary,
        marginBottom: 2,
    },
    desc: {
        fontSize: F.caption,
        color: T.textSecondary,
        lineHeight: 16,
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: R.md,
        padding: S.md,
        columnGap: 10,
        marginTop: 4,
    },
    noteText: {
        flex: 1,
        fontSize: F.caption,
        color: T.textSecondary,
        lineHeight: 18,
    },
});

export default PrivacySettingsScreen;
