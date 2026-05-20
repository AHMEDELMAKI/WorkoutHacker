import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import AuthButton from './AuthButton';
import { AuthColors } from './AuthColors';

type SocialType = 'google' | 'guest';

interface SocialButtonProps {
    type: SocialType;
    onPress: () => void;
}

const CONFIG: Record<SocialType, { title: string; iconName: keyof typeof Ionicons.glyphMap }> = {
    google: {
        title: 'Continue with Google',
        iconName: 'logo-google',
    },
    guest: {
        title: 'Continue as Guest',
        iconName: 'person-outline',
    },
};

const SocialButton: React.FC<SocialButtonProps> = ({ type, onPress }) => {
    const { title, iconName } = CONFIG[type];

    const icon = (
        <Ionicons name={iconName} size={18} color={AuthColors.btnOutlineText} />
    );

    return (
        <AuthButton
            title={title}
            onPress={onPress}
            variant="outline"
            leftIcon={icon}
            style={styles.btn}
        />
    );
};

const styles = StyleSheet.create({
    btn: {
        marginBottom: 12,
    },
});

export default memo(SocialButton);
