import React, { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { validateRegister } from '../../../utils/validation';
import AuthButton from '../components/AuthButton';
import { AuthColors } from '../components/AuthColors';
import AuthContainer from '../components/AuthContainer';
import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';
import SocialButton from '../components/SocialButton';
import { useAuthStore } from '../../../store/authStore';

type Props = AuthStackScreenProps<'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErrors, setLocalErrors] = useState<Record<string, string | undefined>>({});

  const register = useAuthStore((s) => s.register);
  const setGuest = useAuthStore((s) => s.setGuest);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearError = useAuthStore((s) => s.clearError);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const clearLocalError = (field: string) =>
    setLocalErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleRegister = async () => {
    Keyboard.dismiss();
    clearError();

    const validation = validateRegister(name, email, password, confirmPassword);
    if (!validation.isValid) {
      setLocalErrors({
        name: validation.name || undefined,
        email: validation.email || undefined,
        password: validation.password || undefined,
        confirmPassword: validation.confirmPassword || undefined,
      });
      return;
    }
    setLocalErrors({});

    try {
      await register(email, password, name);
      navigation.navigate('OTPVerification', { email });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not create account. Try again.');
    }
  };

  const handleGuestMode = async () => {
    await setGuest(true);
    // AppNavigator swaps the stack automatically
  };

  return (
    <AuthContainer>
      <AuthHeader />

      <View style={styles.body}>
        <Text style={styles.screenTitle}>Create Account</Text>

        <AuthInput
          iconName="person-outline"
          placeholder="Full name"
          value={name}
          onChangeText={(t) => { setName(t); clearLocalError('name'); }}
          error={localErrors.name}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
        />
        <AuthInput
          iconName="mail-outline"
          placeholder="Email or phone number"
          value={email}
          onChangeText={(t) => { setEmail(t); clearLocalError('email'); }}
          error={localErrors.email}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
        <AuthInput
          iconName="lock-closed-outline"
          placeholder="Password"
          value={password}
          onChangeText={(t) => { setPassword(t); clearLocalError('password'); }}
          error={localErrors.password}
          isPassword
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          blurOnSubmit={false}
        />
        <AuthInput
          iconName="lock-closed-outline"
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={(t) => { setConfirmPassword(t); clearLocalError('confirmPassword'); }}
          error={localErrors.confirmPassword}
          isPassword
          returnKeyType="done"
          onSubmitEditing={handleRegister}
        />

        <AuthButton
          title="Sign Up"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.primaryBtn}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.line} />
        </View>

        <SocialButton
          type="guest"
          onPress={handleGuestMode}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: AuthColors.textPrimary,
    marginBottom: 22,
    letterSpacing: 0.2,
  },
  primaryBtn: {
    marginTop: 6,
    marginBottom: 22,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: AuthColors.divider,
  },
  orText: {
    color: AuthColors.textMuted,
    fontSize: 13,
    marginHorizontal: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 4,
  },
  footerText: {
    fontSize: 13,
    color: AuthColors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    color: AuthColors.textPrimary,
    fontWeight: '700',
  },
});

export default RegisterScreen;
