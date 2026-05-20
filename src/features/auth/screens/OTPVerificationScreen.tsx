import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
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
import OTPInput from '../components/OTPInput';

type Props = AuthStackScreenProps<'OTPVerification'>;

const RESEND_SECONDS = 60;

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('ResetPassword', { token: 'mock-token' });
    }, 1500);
  };

  const handleResend = () => {
    setResending(true);
    setOtp(['', '', '', '']);
    setTimeout(() => {
      setResending(false);
      setTimer(RESEND_SECONDS);
    }, 800);
  };

  const isComplete = otp.every((d) => d !== '');

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
            <Ionicons name="shield-checkmark-outline" size={42} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            We have sent a verification code to
          </Text>
          <Text style={styles.emailHighlight} numberOfLines={1}>{email}</Text>

          {/* OTP Boxes */}
          <View style={styles.otpWrap}>
            <OTPInput value={otp} onChange={setOtp} length={4} />
          </View>

          {/* Resend row */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive code? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text style={[styles.resendLink, resending && styles.resendDisabled]}>
                  {resending ? 'Sending…' : 'Resend Now'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <AuthButton
            title="Verify"
            onPress={handleVerify}
            loading={loading}
            disabled={!isComplete}
            style={styles.verifyBtn}
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
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: AuthColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 28,
    maxWidth: 280,
    textAlign: 'center',
  },
  otpWrap: {
    width: '100%',
    marginBottom: 24,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  resendLabel: {
    fontSize: 13,
    color: AuthColors.textSecondary,
  },
  timerText: {
    fontSize: 13,
    color: AuthColors.textSecondary,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    opacity: 0.5,
  },
  verifyBtn: {
    width: '100%',
  },
});

export default OTPVerificationScreen;
