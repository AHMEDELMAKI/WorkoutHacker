// File: src/features/home/components/GreetingHeader.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import AppText from '../../../components/AppText';
import { Colors, Spacing } from '../../../theme';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

const GreetingHeader = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-10)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
    });

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.row}>
                <View style={styles.textBlock}>
                    <AppText variant="bodySmall" color={Colors.textSecondary}>{today}</AppText>
                    <AppText variant="h2">
                        {getGreeting()},{'\n'}
                        <AppText variant="h2" color={Colors.primaryLight}>Athlete 👋</AppText>
                    </AppText>
                </View>
                {/* Avatar placeholder */}
                <View style={styles.avatar}>
                    <AppText variant="h3" style={{ textAlign: 'center' }}>💪</AppText>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.lg },
    row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    textBlock: { gap: Spacing.xs, flex: 1 },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.surfaceElevated,
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default GreetingHeader;