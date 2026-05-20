import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../../components/AppButton';
import AppText from '../../../components/AppText';
import type { OnboardingStackScreenProps } from '../../../navigation/types';
import { Colors, Spacing } from '../../../theme';

type Props = OnboardingStackScreenProps<'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <AppText variant="display" center style={styles.emoji}>🦾</AppText>
                    <AppText variant="h1" center>Workout Hacker</AppText>
                    <AppText variant="body" center color={Colors.textSecondary} style={styles.subtitle}>
                        Personalized fitness plans powered by artificial intelligence.
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <AppButton
                        title="Get Started"
                        onPress={() => (navigation.getParent() as any)?.replace('Auth')}
                        style={styles.btn}
                    />
                    <TouchableOpacity onPress={() => (navigation.getParent() as any)?.replace('Auth')}>
                        <AppText variant="body" color={Colors.primary} bold center style={styles.loginLink}>
                            Already have an account? Sign In
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'space-between',
    },
    content: {
        marginTop: 100,
    },
    emoji: {
        fontSize: 80,
        marginBottom: Spacing.lg,
    },
    subtitle: {
        marginTop: Spacing.md,
        lineHeight: 24,
    },
    footer: {
        marginBottom: Spacing.xl,
    },
    btn: {
        marginBottom: Spacing.lg,
    },
    loginLink: {
        marginTop: Spacing.sm,
    },
});

export default WelcomeScreen;
