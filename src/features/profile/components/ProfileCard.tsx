// src/features/profile/components/ProfileCard.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { PPT } from './ProfileTheme';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
}

const ProfileCard: React.FC<Props> = ({ children, style }) => (
    <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: PPT.cardBg,
        borderRadius: PPT.radius.xl,
        padding: PPT.cardPadding,
        marginBottom: 16,
        shadowColor: PPT.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
    },
});

export default ProfileCard;
