import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { AuthStackScreenProps } from '../../../navigation/types';
import AuthButton from '../components/AuthButton';
import { AuthColors } from '../components/AuthColors';
import AuthContainer from '../components/AuthContainer';
import AuthHeader from '../components/AuthHeader';

type Props = AuthStackScreenProps<'Success'>;

const SuccessScreen: React.FC<Props> = ({ navigation }) => {
    const scaleAnim = useRef(new Animated.Value(0.6)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 12,
                bounciness: 10,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <AuthContainer scrollable={false}>
            <AuthHeader />

            <View style={styles.body}>
                <Animated.View
                    style={[
                        styles.iconCircle,
                        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
                    ]}
                >
                    <Ionicons name="checkmark-circle" size={60} color="#FFFFFF" />
                </Animated.View>

                <Animated.View style={{ opacity: opacityAnim, alignItems: 'center' }}>
                    <Text style={styles.title}>Congratulations!</Text>
                    <Text style={styles.subtitle}>
                        Your account password has been successfully changed.{'\n'}
                        You can now log in with your new password.
                    </Text>
                </Animated.View>

                <View style={styles.btnWrap}>
                    <AuthButton
                        title="Login  →"
                        onPress={() => navigation.replace('Login')}
                        style={styles.loginBtn}
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.20)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.38)',
        marginBottom: 30,
        // glow effect
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 0,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 14,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 14,
        color: AuthColors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
    },
    btnWrap: {
        width: '100%',
        marginTop: 40,
    },
    loginBtn: {
        width: '100%',
    },
});

export default SuccessScreen;
