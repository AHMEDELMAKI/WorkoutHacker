import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import AppText from './AppText';
import { Colors, Spacing, FontSizes, FontWeights } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const AppButton: React.FC<AppButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';
    const isDanger = variant === 'danger';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.base,
                (styles as any)[variant],
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={isOutline || isGhost ? Colors.primary : Colors.white}
                />
            ) : (
                <AppText
                    variant="button"
                    style={[
                        styles.text,
                        (styles as any)[`${variant}Text`],
                        disabled && styles.disabledText,
                        textStyle,
                    ]}
                >
                    {title}
                </AppText>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        flexDirection: 'row',
    },
    primary: {
        backgroundColor: Colors.primary,
    },
    secondary: {
        backgroundColor: Colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: Colors.error,
    },
    disabled: {
        backgroundColor: Colors.surfaceBorder,
        borderColor: 'transparent',
    },
    text: {
        fontWeight: FontWeights.bold,
    },
    primaryText: {
        color: Colors.white,
    },
    secondaryText: {
        color: Colors.white,
    },
    outlineText: {
        color: Colors.primary,
    },
    ghostText: {
        color: Colors.primary,
    },
    dangerText: {
        color: Colors.white,
    },
    disabledText: {
        color: Colors.textMuted,
    },
});

export default AppButton;
