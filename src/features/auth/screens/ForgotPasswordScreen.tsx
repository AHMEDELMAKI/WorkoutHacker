import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AuthStackScreenProps } from '../../../navigation/types';
import AuthButton from '../components/AuthButton';
import { AuthColors } from '../components/AuthColors';
import AuthContainer from '../components/AuthContainer';
import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';

type Props = AuthStackScreenProps<'ForgotPassword'>;
type Mode = 'email' | 'phone';

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [mode, setMode] = useState<Mode>('email');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const isEmail = mode === 'email';

  const handleSend = () => {
    if (!value.trim()) {
      setError(isEmail ? 'Please enter your email address' : 'Please enter your phone number');
      return;
    }
    setError(undefined);
    Keyboard.dismiss();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OTPVerification', { email: value });
    }, 1500);
  };

  const toggleMode = () => {
    setValue('');
    setError(undefined);
    setMode((m) => (m === 'email' ? 'phone' : 'email'));
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
          {/* Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={42} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            {isEmail
              ? 'Enter your email and we will send\na verification code to reset your password.'
              : 'Enter your phone number and we will send\na verification code to reset your password.'}
          </Text>

          <AuthInput
            iconName={isEmail ? 'mail-outline' : 'call-outline'}
            placeholder={isEmail ? 'Email address' : 'Phone number'}
            value={value}
            onChangeText={(t) => { setValue(t); setError(undefined); }}
            error={error}
            keyboardType={isEmail ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            containerStyle={styles.inputFull}
            returnKeyType="done"
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity
            onPress={toggleMode}
            style={styles.toggleBtn}
            accessibilityRole="button"
          >
            <Text style={styles.toggleText}>
              {isEmail ? 'Use Phone Number Instead' : 'Use Email Instead'}
            </Text>
          </TouchableOpacity>

          <AuthButton
            title="Send Code  →"
            onPress={handleSend}
            loading={loading}
            style={styles.sendBtn}
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
  toggleBtn: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  sendBtn: {
    width: '100%',
  },
});

export default ForgotPasswordScreen;
