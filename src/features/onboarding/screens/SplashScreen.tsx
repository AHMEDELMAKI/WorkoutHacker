// File: src/features/onboarding/screens/SplashScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { logoImage } from '../../../assets/images';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const { width: W } = Dimensions.get('window');
const LOGO_SIZE = W * 0.45;

const SplashScreen = () => {
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('OnboardingSlides');
        }, 2200);
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor="#875BA4" />

            {/* Center content */}
            <View style={styles.centerContent}>
                {/* Outer glow ring */}
                <Image
                    source={logoImage}
                    style={styles.logoImage}
                    resizeMode="contain"
                />

                <Text style={styles.appName}>WORKOUT{'\n'}HACKER</Text>

                {/* Spinner */}
                <ActivityIndicator
                    size="large"
                    color="rgba(255,255,255,0.8)"
                    style={styles.spinner}
                />
            </View>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <Text style={styles.footerText}>Train Smart. Stay Safe. Your Privacy First</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#875BA4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    outerRing: {
        width: Dimensions.get('window').width * 0.45 + 28,
        height: Dimensions.get('window').width * 0.45 + 28,
        borderRadius: (Dimensions.get('window').width * 0.45 + 28) / 2,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    logoCircle: {
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    logoEmoji: {
        fontSize: 52,
    },
    appName: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 4,
        textAlign: 'center',
        lineHeight: 30,
    },
    spinner: {
        marginTop: 8,
    },
    footer: {
        paddingHorizontal: 32,
        paddingTop: 16,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    logoImage: {
        width: 160,
        height: 160,
        alignSelf: 'center',
        marginTop: 20,
    },


});

export default SplashScreen;
