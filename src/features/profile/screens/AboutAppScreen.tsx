import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProfileStackParamList } from '../../../navigation/types';
import ProfileCard from '../components/ProfileCard';
import { PPT } from '../components/ProfileTheme';
import TagChip from '../components/TagChip';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AboutApp'>;

const TECHNOLOGIES = [
    { label: 'TensorFlow', color: PPT.accent },
    { label: 'Computer Vision', color: '#0EA5E9' },
    { label: 'React Native', color: '#10B981' },
    { label: 'Machine Learning', color: '#F59E0B' },
    { label: 'Local Storage', color: '#6B7280' },
];

const AboutAppScreen: React.FC<Props> = ({ navigation }) => (
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
                    >
                        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>About This App</Text>
                    <View style={{ width: 38 }} />
                </View>
            </SafeAreaView>
        </View>

        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* App identity card */}
            <ProfileCard style={styles.appCard}>
                <View style={styles.logoCircle}>
                    <Ionicons name="barbell" size={34} color="#FFFFFF" />
                </View>
                <Text style={styles.appName}>Workout Hacker</Text>
                <View style={styles.versionBadge}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ProfileCard>

            {/* Graduation project */}
            <ProfileCard>
                <Text style={styles.cardTitle}>Graduation Project</Text>
                {[
                    { label: 'Supervisor', value: 'Dr. Mohamed El-habrouk' },
                    { label: 'Department', value: 'Computing  & data Science' },
                    { label: 'Year', value: '2025 – 2026' },
                ].map((row, i, arr) => (
                    <React.Fragment key={row.label}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{row.label}</Text>
                            <Text style={styles.infoValue}>{row.value}</Text>
                        </View>
                        {i < arr.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                ))}
            </ProfileCard>

            {/* Technologies */}
            <ProfileCard>
                <Text style={styles.cardTitle}>Technologies Used</Text>
                <View style={styles.tagsWrap}>
                    {TECHNOLOGIES.map(t => (
                        <TagChip key={t.label} label={t.label} color={t.color} />
                    ))}
                </View>
            </ProfileCard>

            {/* Footer */}
            <Text style={styles.footer}>Made with ❤️ for safer and smarter workouts</Text>
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: PPT.bgLight },
    headerBg: {
        backgroundColor: PPT.bgPrimary,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        paddingHorizontal: 24, paddingBottom: 24,
        elevation: 10, shadowColor: PPT.bgPrimary,
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.38, shadowRadius: 14,
    },
    headerRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

    // App card
    appCard: { alignItems: 'center', paddingVertical: 28 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: PPT.bgPrimary,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
        shadowColor: PPT.bgPrimary,
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.40, shadowRadius: 12, elevation: 8,
    },
    appName: {
        fontSize: 20, fontWeight: '800', color: PPT.textPrimary, marginBottom: 8,
    },
    versionBadge: {
        backgroundColor: PPT.accentDim, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5,
    },
    versionText: { fontSize: 12, fontWeight: '700', color: PPT.accent },

    // Graduation
    cardTitle: { fontSize: 13, fontWeight: '700', color: PPT.textPrimary, marginBottom: 8, letterSpacing: 0.2 },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12,
    },
    infoLabel: { fontSize: 13, color: PPT.textSecondary, fontWeight: '500' },
    infoValue: { fontSize: 13, color: PPT.textPrimary, fontWeight: '700', flex: 1, textAlign: 'right' },
    divider: { height: 1, backgroundColor: PPT.cardBorder },

    // Tags
    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },

    // Footer
    footer: {
        fontSize: 12, color: PPT.textSecondary, textAlign: 'center',
        fontWeight: '500', marginTop: 8, marginBottom: 16,
    },
});

export default AboutAppScreen;
