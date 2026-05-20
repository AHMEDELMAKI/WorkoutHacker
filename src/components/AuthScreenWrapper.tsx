import React from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors, Spacing } from '../theme';

interface Props {
    children: React.ReactNode;
}

const AuthScreenWrapper: React.FC<Props> = ({ children }) => {
    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
        >
            {children}
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flexGrow: 1,
        padding: Spacing.xl,
    },
});

export default AuthScreenWrapper;
