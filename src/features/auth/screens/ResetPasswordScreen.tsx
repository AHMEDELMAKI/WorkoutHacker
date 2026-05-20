import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
import {
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import type { AuthStackScreenProps } from '../../../navigation/types';
import AuthButton from '../components/AuthButton';
import { AuthColors } from '../components/AuthColors';
import AuthContainer from '../components/AuthContainer';
import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';

type Props = AuthStackScreenProps<'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
    const { token } = route.params;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
    const [loading, setLoading] = useState(false);

    const confirmRef = useRef<TextInput>(null);

    const handleReset = () => {
        const newErrors: typeof errors = {};
        if (!password || password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (password !== confirmPassword) {
            newErrors.confirm = 'Passwords do not match';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        Keyboard.dismiss();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('Success');
        }, 1500);
    };

    return (
        <AuthContainer>
            <AuthHeader />

            <View style={styles.body}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.centered}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="key-outline" size={42} color="#FFFFFF" />
                    </View>

                    <Text style={styles.title}>New Password</Text>
                    <Text style={styles.subtitle}>
                        Create a strong password of at least 8 characters to secure your account.
                    </Text>

                    <AuthInput
                        iconName="lock-closed-outline"
                        placeholder="New password"
                        value={password}
                        onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                        error={errors.password}
                        isPassword
                        containerStyle={styles.inputFull}
                        returnKeyType="next"
                        onSubmitEditing={() => confirmRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                    <AuthInput
                        iconName="lock-closed-outline"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirm: undefined })); }}
                        error={errors.confirm}
                        isPassword
                        containerStyle={styles.inputFull}
                        returnKeyType="done"
                        onSubmitEditing={handleReset}
                    />

                    <AuthButton
                        title="Save Password"
                        onPress={handleReset}
                        loading={loading}
                        style={styles.saveBtn}
                    />
                </View>
            </View>
        </AuthContainer>
    );
};

const styles = StyleSheet.create({
    body: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 18,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        marginBottom: 8,
    },
    centered: {
        alignItems: 'center',
        paddingTop: 8,
    },
    iconCircle: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.32)',
        marginBottom: 26,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: 14,
        color: AuthColors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
        paddingHorizontal: 6,
    },
    inputFull: {
        width: '100%',
    },
    saveBtn: {
        width: '100%',
        marginTop: 10,
    },
});

export default ResetPasswordScreen;
