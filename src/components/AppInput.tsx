import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    TextInputProps,
    ViewStyle
} from 'react-native';
import AppText from './AppText';
import { Colors, Spacing, FontSizes, FontWeights } from '../theme';

interface AppInputProps extends TextInputProps {
    label?: string;
    error?: string;
    isPassword?: boolean;
    containerStyle?: ViewStyle;
}

const AppInput: React.FC<AppInputProps> = ({
    label,
    error,
    isPassword,
    containerStyle,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.label}>
                    {label}
                </AppText>
            )}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    !!error && styles.inputError,
                ]}
            >
                <TextInput
                    style={styles.input}
                    placeholderTextColor={Colors.placeholder}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                    >
                        <AppText style={styles.eyeText}>{isPasswordVisible ? '👁️' : '🙈'}</AppText>
                    </TouchableOpacity>
                )}
            </View>
            {error ? (
                <AppText variant="caption" color={Colors.error} style={styles.errorText}>
                    {error}
                </AppText>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    label: {
        marginBottom: Spacing.xs,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputFocused: {
        borderColor: Colors.primary,
    },
    inputError: {
        borderColor: Colors.error,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: Spacing.md,
        fontSize: FontSizes.md,
        color: Colors.text,
    },
    eyeIcon: {
        padding: Spacing.md,
    },
    eyeText: {
        fontSize: 18,
    },
    errorText: {
        marginTop: 4,
        marginLeft: 4,
    },
});

export default AppInput;
