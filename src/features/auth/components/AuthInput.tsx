import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { memo, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { AuthColors } from './AuthColors';

interface AuthInputProps extends TextInputProps {
    iconName?: keyof typeof Ionicons.glyphMap;
    isPassword?: boolean;
    error?: string;
    containerStyle?: ViewStyle;
    accessibilityLabel?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({
    iconName,
    isPassword = false,
    error,
    containerStyle,
    accessibilityLabel,
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showText, setShowText] = useState(!isPassword);
    const borderAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(borderAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(borderAnim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    };

    const animatedBorderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            error ? AuthColors.inputBorderError : AuthColors.inputBorder,
            error ? AuthColors.inputBorderError : AuthColors.inputBorderFocused,
        ],
    });

    const animatedBorderWidth = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1.5, 2],
    });

    return (
        <View style={[styles.wrapper, containerStyle]}>
            <Animated.View
                style={[
                    styles.row,
                    {
                        borderColor: animatedBorderColor,
                        borderWidth: animatedBorderWidth,
                    },
                ]}
            >
                {iconName && (
                    <Ionicons
                        name={iconName}
                        size={18}
                        color={isFocused ? '#FFFFFF' : AuthColors.placeholder}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={AuthColors.placeholder}
                    secureTextEntry={isPassword && !showText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    accessibilityLabel={accessibilityLabel ?? rest.placeholder}
                    {...rest}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowText((v) => !v)}
                        style={styles.eyeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel={showText ? 'Hide password' : 'Show password'}
                        accessibilityRole="button"
                    >
                        <Ionicons
                            name={showText ? 'eye-outline' : 'eye-off-outline'}
                            size={19}
                            color={isFocused ? 'rgba(255,255,255,0.80)' : AuthColors.placeholder}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
            {!!error && (
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 14,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AuthColors.inputBg,
        borderRadius: 30,
        height: 54,
        paddingHorizontal: 18,
    },
    icon: {
        marginRight: 10,
        width: 20,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#FFFFFF',
        height: '100%',
        paddingVertical: 0,
    },
    eyeBtn: {
        paddingLeft: 8,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 12,
        color: AuthColors.inputBorderError,
        marginTop: 5,
        marginLeft: 18,
        fontWeight: '500',
    },
});

export default memo(AuthInput);
