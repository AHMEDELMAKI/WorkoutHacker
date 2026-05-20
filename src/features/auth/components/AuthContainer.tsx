import React, { memo, useEffect, useRef } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthColors } from './AuthColors';

interface AuthContainerProps {
    children: React.ReactNode;
    scrollable?: boolean;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
    children,
    scrollable = true,
}) => {
    // Fade-in animation on mount
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const inner = scrollable ? (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
        >
            {children}
        </ScrollView>
    ) : (
        <View style={styles.staticContent}>{children}</View>
    );

    return (
        <View style={styles.root}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={AuthColors.bgPrimary}
                translucent={false}
            />
            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
                        {inner}
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: AuthColors.bgPrimary,
    },
    safe: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    staticContent: {
        flex: 1,
    },
});

export default memo(AuthContainer);
