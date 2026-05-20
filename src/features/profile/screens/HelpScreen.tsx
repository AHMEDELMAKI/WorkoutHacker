import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ProfileStackParamList } from '../../../navigation/types';
import ProfileCard from '../components/ProfileCard';
import { PPT } from '../components/ProfileTheme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Help'>;

const HelpScreen: React.FC<Props> = ({ navigation }) => {
    const TRACKING = [
        { icon: 'analytics-outline' as const, label: 'Rep Counting', desc: 'AI counts every rep using camera vision in real time.' },
        { icon: 'body-outline' as const, label: 'Form Analysis', desc: 'Skeleton detection flags bad posture before injury occurs.' },
        { icon: 'cellular-outline' as const, label: 'Fatigue Detection', desc: 'Speed drops and movement variance signal when you\'re tiring.' },
    ];

    const FAQ = [
        { q: 'Is my data stored online?', a: 'All data is processed on-device by default. Cloud sync is optional.' },
        { q: 'Who can see my workouts?', a: 'Only you. No data is shared without your explicit consent.' },
        { q: 'How is the camera data used?', a: 'Camera frames are used only for live analysis and never stored.' },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={PPT.bgPrimary} />

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
                        <Text style={styles.headerTitle}>Need Help?</Text>
                        <View style={{ width: 38 }} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* How Tracking Works */}
                <ProfileCard>
                    <Text style={styles.cardTitle}>How Tracking Works</Text>
                    {TRACKING.map((item, i, arr) => (
                        <React.Fragment key={item.label}>
                            <View style={styles.featureRow}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name={item.icon} size={18} color={PPT.accent} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.featureLabel}>{item.label}</Text>
                                    <Text style={styles.featureDesc}>{item.desc}</Text>
                                </View>
                            </View>
                            {i < arr.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </ProfileCard>

                {/* Privacy FAQ */}
                <ProfileCard>
                    <Text style={styles.cardTitle}>Privacy Questions</Text>
                    {FAQ.map((item, i, arr) => (
                        <React.Fragment key={item.q}>
                            <View style={styles.faqItem}>
                                <Text style={styles.faqQ}>{item.q}</Text>
                                <Text style={styles.faqA}>{item.a}</Text>
                            </View>
                            {i < arr.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </ProfileCard>

                {/* Contact Support */}
                <ProfileCard>
                    <Text style={styles.cardTitle}>Contact Support</Text>
                    <Text style={styles.supportText}>
                        Can't find what you're looking for? Send us a message and we'll respond within 24 hours.
                    </Text>
                    <TouchableOpacity
                        style={styles.contactBtn}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        onPress={() => Alert.alert('Support', 'Support messaging will be available soon.')}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.contactBtnText}>Send Message</Text>
                    </TouchableOpacity>
                </ProfileCard>
            </ScrollView>
        </View>
    );
};

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
    cardTitle: { fontSize: 13, fontWeight: '700', color: PPT.textPrimary, marginBottom: 8, letterSpacing: 0.2 },
    featureRow: { flexDirection: 'row', columnGap: 12, paddingVertical: 12 },
    featureIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: PPT.accentDim, alignItems: 'center', justifyContent: 'center',
    },
    featureLabel: { fontSize: 13, fontWeight: '700', color: PPT.textPrimary, marginBottom: 3 },
    featureDesc: { fontSize: 12, color: PPT.textSecondary, lineHeight: 16 },
    divider: { height: 1, backgroundColor: PPT.cardBorder },
    faqItem: { paddingVertical: 12 },
    faqQ: { fontSize: 13, fontWeight: '700', color: PPT.textPrimary, marginBottom: 4 },
    faqA: { fontSize: 12, color: PPT.textSecondary, lineHeight: 17 },
    supportText: { fontSize: 13, color: PPT.textSecondary, lineHeight: 19, marginBottom: 14 },
    contactBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: 48, borderRadius: 999, backgroundColor: PPT.bgPrimary, columnGap: 8,
        shadowColor: PPT.bgPrimary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.38, shadowRadius: 10, elevation: 5,
    },
    contactBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default HelpScreen;
