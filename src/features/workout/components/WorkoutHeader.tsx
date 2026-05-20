// src/features/workout/components/WorkoutHeader.tsx
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../../components/AppText';
import { WT } from '../../../theme/workoutTheme';

interface WorkoutHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
    title,
    subtitle,
    showBack = false,
    onBack,
}) => {
    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']}>
                <View style={styles.inner}>
                    {showBack && (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={onBack}
                            activeOpacity={0.75}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="chevron-back" size={22} color={WT.colors.textLight} />
                        </TouchableOpacity>
                    )}
                    <View style={[styles.textBlock, showBack && styles.textWithBack]}>
                        <AppText
                            variant="h2"
                            color={WT.colors.textLight}
                            style={styles.title}
                        >
                            {title}
                        </AppText>
                        {subtitle ? (
                            <AppText
                                variant="body"
                                color="rgba(255,255,255,0.80)"
                                style={styles.subtitle}
                            >
                                {subtitle}
                            </AppText>
                        ) : null}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WT.colors.header,
        borderBottomLeftRadius: WT.radius.lg,
        borderBottomRightRadius: WT.radius.lg,
        paddingBottom: WT.spacing.lg,
        paddingHorizontal: WT.spacing.lg,
        shadowColor: '#4A2878',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: WT.spacing.md,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: WT.spacing.sm,
        flexShrink: 0,
    },
    textBlock: {
        flex: 1,
    },
    textWithBack: {
        flex: 1,
    },
    title: {
        fontWeight: '800',
        marginBottom: 2,
    },
    subtitle: {
        fontWeight: '500',
    },
});

export default WorkoutHeader;
