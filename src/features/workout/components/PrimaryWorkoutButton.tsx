// src/features/workout/components/PrimaryWorkoutButton.tsx
import React, { useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { WT } from '../../../theme/workoutTheme';

interface PrimaryWorkoutButtonProps {
    label: string;
    onPress?: () => void;
    icon?: React.ReactNode;
    style?: ViewStyle;
    disabled?: boolean;
    variant?: 'white' | 'purple';
}

const PrimaryWorkoutButton: React.FC<PrimaryWorkoutButtonProps> = ({
    label,
    onPress,
    icon,
    style,
    disabled = false,
    variant = 'white',
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const pressIn = () =>
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 60,
        }).start();

    const pressOut = () =>
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 60,
        }).start();

    const isWhite = variant === 'white';

    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={pressIn}
                onPressOut={pressOut}
                activeOpacity={1}
                disabled={disabled}
                style={[
                    styles.btn,
                    isWhite ? styles.btnWhite : styles.btnPurple,
                    disabled && styles.disabled,
                ]}
            >
                {icon ? <Animated.View style={styles.iconWrap}>{icon}</Animated.View> : null}
                <Text
                    style={[
                        styles.label,
                        { color: isWhite ? WT.colors.primary : WT.colors.textLight },
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: WT.radius.xl,
        paddingHorizontal: WT.spacing.xl,
        gap: 8,
    },
    btnWhite: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 8,
    },
    btnPurple: {
        backgroundColor: WT.colors.primary,
        shadowColor: '#4A2878',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 8,
    },
    iconWrap: {
        marginRight: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    disabled: {
        opacity: 0.55,
    },
});

export default PrimaryWorkoutButton;
