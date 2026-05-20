import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { memo, useEffect, useRef } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SetupTheme as T } from './SetupTheme';

const TOTAL_STEPS = 7;

interface SetupWrapperProps {
    step: number;            // 1-based
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onBack?: () => void;
    canContinue?: boolean;
    onContinue: () => void;
    continueLabel?: string;
    onBack2?: never;         // unused, prevents accidental prop collisions
    showBack?: boolean;
    scrollable?: boolean;
    footerContent?: React.ReactNode; // optional extra footer content
}

const SetupWrapper: React.FC<SetupWrapperProps> = ({
    step,
    title,
    subtitle,
    children,
    onBack,
    canContinue = true,
    onContinue,
    continueLabel = 'Continue',
    showBack = true,
    scrollable = false,
    footerContent,
}) => {
    const insets = useSafeAreaInsets();

    // Screen fade-in
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const InnerContent = scrollable ? ScrollView : View;
    const innerProps = scrollable
        ? { showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: 'handled' as const, contentContainerStyle: styles.scrollContent }
        : { style: styles.flex };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={T.bgPrimary} />

            <SafeAreaView style={styles.flex} edges={['top']}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
                        {/* ── Header Card ── */}
                        <View style={styles.headerCard}>
                            <View style={styles.headerTop}>
                                {/* Back button */}
                                {showBack && onBack ? (
                                    <TouchableOpacity
                                        onPress={onBack}
                                        style={styles.backBtn}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Go back"
                                    >
                                        <Ionicons name="arrow-back" size={22} color={T.bgPrimary} />
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.backBtn} />
                                )}

                                <Text style={styles.stepLabel}>Step {step}/{TOTAL_STEPS}</Text>

                                <View style={styles.backBtn} />
                            </View>

                            {/* Progress pills */}
                            <View style={styles.pillRow}>
                                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.pill,
                                            i < step ? styles.pillActive : styles.pillInactive,
                                        ]}
                                    />
                                ))}
                            </View>

                            {/* Title + subtitle */}
                            <Text style={styles.title}>{title}</Text>
                            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                        </View>

                        {/* ── Content ── */}
                        <InnerContent {...(innerProps as any)}>
                            {children}
                        </InnerContent>

                        {/* ── Footer ── */}
                        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                            {footerContent}
                            <TouchableOpacity
                                onPress={onContinue}
                                disabled={!canContinue}
                                activeOpacity={0.85}
                                style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
                                accessibilityRole="button"
                                accessibilityLabel={continueLabel}
                                accessibilityState={{ disabled: !canContinue }}
                            >
                                <Text style={[styles.continueBtnText, !canContinue && styles.continueBtnTextDisabled]}>
                                    {continueLabel}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const { spacing: S, radius: R, font: F } = T;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: T.bgPrimary,
    },
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1 },

    // Header card
    headerCard: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingHorizontal: S.lg,
        paddingTop: S.md,
        paddingBottom: S.lg,
        shadowColor: 'rgba(0,0,0,0.20)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 14,
        elevation: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: S.md,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    stepLabel: {
        fontSize: F.caption,
        fontWeight: '700',
        color: T.bgPrimary,
        letterSpacing: 0.3,
    },

    // Progress pills
    pillRow: {
        flexDirection: 'row',
        columnGap: 5,
        marginBottom: S.lg,
    },
    pill: {
        flex: 1,
        height: 5,
        borderRadius: R.full,
    },
    pillActive: { backgroundColor: T.bgPrimary },
    pillInactive: { backgroundColor: 'rgba(135,91,164,0.20)' },

    // Title/subtitle
    title: {
        fontSize: F.title,
        fontWeight: '800',
        color: T.bgPrimary,
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: F.subtitle,
        color: 'rgba(107,63,160,0.65)',
        fontWeight: '400',
        lineHeight: 20,
    },

    // Footer
    footer: {
        paddingHorizontal: S.lg,
        paddingTop: S.md,
        rowGap: 10,
    },
    continueBtn: {
        height: T.buttonHeight,
        backgroundColor: '#FFFFFF',
        borderRadius: R.xl,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: T.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 10,
        elevation: 5,
    },
    continueBtnDisabled: {
        backgroundColor: T.btnDisabledBg,
        elevation: 0,
        shadowOpacity: 0,
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: T.btnText,
        letterSpacing: 0.3,
    },
    continueBtnTextDisabled: {
        color: T.btnDisabledText,
    },
});

export default memo(SetupWrapper);