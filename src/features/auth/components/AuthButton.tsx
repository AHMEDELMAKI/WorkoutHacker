import React, { memo, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TextStyle,
    TouchableWithoutFeedback,
    ViewStyle
} from 'react-native';
import { AuthColors } from './AuthColors';

type AuthButtonVariant = 'primary' | 'outline';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    variant?: AuthButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    accessibilityLabel?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    leftIcon,
    accessibilityLabel,
}) => {
    const isPrimary = variant === 'primary';
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 40,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 40,
        }).start();
    };

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityState={{ disabled: disabled || loading, busy: loading }}
        >
            <Animated.View
                style={[
                    styles.base,
                    isPrimary ? styles.primary : styles.outline,
                    disabled && styles.disabled,
                    { transform: [{ scale: scaleAnim }] },
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        color={isPrimary ? AuthColors.btnText : AuthColors.btnOutlineText}
                        size="small"
                    />
                ) : (
                    <>
                        {leftIcon}
                        <Text
                            style={[
                                styles.label,
                                isPrimary ? styles.primaryLabel : styles.outlineLabel,
                                !!leftIcon && styles.labelWithIcon,
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    base: {
        height: 54,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        shadowColor: AuthColors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 10,
        elevation: 5,
    },
    primary: {
        backgroundColor: AuthColors.btnBg,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: AuthColors.btnOutlineBorder,
        elevation: 0,
        shadowOpacity: 0,
    },
    disabled: {
        opacity: 0.50,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    labelWithIcon: {
        marginLeft: 10,
    },
    primaryLabel: {
        color: AuthColors.btnText,
    },
    outlineLabel: {
        color: AuthColors.btnOutlineText,
    },
});

export default memo(AuthButton);
