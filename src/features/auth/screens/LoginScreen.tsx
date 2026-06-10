import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { useAuthStore } from '../../../store/authStore';
import { validateLogin } from '../../../utils/validation';
import AuthButton from '../components/AuthButton';
import { AuthColors } from '../components/AuthColors';
import AuthContainer from '../components/AuthContainer';
import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';
import SocialButton from '../components/SocialButton';

type Props = AuthStackScreenProps<'Login'>;

const isUnregisteredEmailError = (err: any) => {
  const statusCode = err?.statusCode;
  const message = String(err?.message || '').toLowerCase();

  // Only redirect to Register if the backend explicitly says the user/email is not found.
  // We avoid redirecting on generic 404s which might indicate a missing API route.
  const isUserNotFoundMessage = 
    message.includes('user not found') ||
    message.includes('account not found') ||
    message.includes('email not found') ||
    message.includes('not registered') ||
    message.includes('no account');

  return statusCode === 404 && isUserNotFoundMessage;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});
  
  const login = useAuthStore((s) => s.login);
  const setGuest = useAuthStore((s) => s.setGuest);
  const isLoading = useAuthStore((s) => s.isLoading);
  const globalError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    clearError();
    
    const validation = validateLogin(email, password);
    if (!validation.isValid) {
      setLocalErrors({
        email: validation.email || undefined,
        password: validation.password || undefined,
      });
      return;
    }

    setLocalErrors({});

    try {
      await login(email, password);
      // AppNavigator will automatically transition to Main or ProfileSetup
      // because isAuthenticated and user state change in the store.
    } catch (err: any) {
      if (isUnregisteredEmailError(err)) {
        setEmail('');
        setPassword('');
        navigation.navigate('Register');
      } else {
        // Show generic error for invalid password or other issues
        Alert.alert('Login Failed', err.message || 'Invalid email or password');
      }
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
        <Text style={styles.screenTitle}>Sign In</Text>

        <AuthInput
          iconName="mail-outline"
          placeholder="Email address"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setLocalErrors((e) => ({ ...e, email: undefined }));
            if (globalError) clearError();
          }}
          error={localErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />

        <AuthInput
          iconName="lock-closed-outline"
          placeholder="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setLocalErrors((e) => ({ ...e, password: undefined }));
            if (globalError) clearError();
          }}
          error={localErrors.password}
          isPassword
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        {/* Remember Me + Forgot */}
        <View style={styles.rememberRow}>
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setRememberMe((v) => !v)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
            accessibilityLabel="Remember me"
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={12} color={AuthColors.bgPrimary} />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="link"
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <AuthButton title="Login" onPress={handleLogin} loading={isLoading} style={styles.primaryBtn} />

        {/* Divider */}
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
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={styles.footerLink}>Create Account</Text>
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
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
    marginTop: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: AuthColors.checkboxBorder,
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: AuthColors.checkboxChecked,
    borderColor: AuthColors.checkboxChecked,
  },
  rememberText: {
    fontSize: 13,
    color: AuthColors.textSecondary,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: AuthColors.textPrimary,
    fontWeight: '600',
  },
  primaryBtn: {
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

export default LoginScreen;
