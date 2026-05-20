import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { memo } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuthColors } from './AuthColors';

const AuthHeader: React.FC = () => {
    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                {/* Logo */}
                <View style={styles.logoRow}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="barbell-outline" size={20} color={AuthColors.bgPrimary} />
                    </View>
                    <Text style={styles.appName}>Workout Hacker</Text>
                </View>

                {/* Language */}
                <TouchableOpacity
                    style={styles.langBtn}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Select language"
                >
                    <Ionicons name="globe-outline" size={13} color={AuthColors.bgPrimary} />
                    <Text style={styles.langText}>English</Text>
                </TouchableOpacity>
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeTitle}>Welcome to Workout Hacker</Text>
            <Text style={styles.welcomeSub}>Your gym friend, right in your pocket</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 26,
        // iOS shadow
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 14,
        // Android shadow
        elevation: 10,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 9,
    },
    logoCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(135,91,164,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(135,91,164,0.18)',
    },
    appName: {
        fontSize: 15,
        fontWeight: '800',
        color: AuthColors.bgPrimary,
        letterSpacing: 0.2,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 4,
        borderWidth: 1,
        borderColor: 'rgba(135,91,164,0.25)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        minHeight: 28,
    },
    langText: {
        fontSize: 12,
        fontWeight: '600',
        color: AuthColors.bgPrimary,
    },
    welcomeTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: AuthColors.bgPrimary,
        marginBottom: 5,
        letterSpacing: 0.1,
    },
    welcomeSub: {
        fontSize: 13,
        fontWeight: '400',
        color: 'rgba(107,63,160,0.65)',
        lineHeight: 18,
    },
});

export default memo(AuthHeader);
