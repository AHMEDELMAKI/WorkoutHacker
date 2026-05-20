// src/features/profile/components/SettingsItem.tsx
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PPT } from './ProfileTheme';

interface Props {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    isLast?: boolean;
    danger?: boolean;
}

const SettingsItem: React.FC<Props> = ({ icon, title, onPress, isLast = false, danger = false }) => (
    <>
        <TouchableOpacity
            style={styles.row}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={title}
        >
            <View style={[styles.iconWrap, { backgroundColor: danger ? PPT.dangerDim : PPT.accentDim }]}>
                <Ionicons name={icon} size={18} color={danger ? PPT.danger : PPT.accent} />
            </View>
            <Text style={[styles.title, danger && styles.dangerText]}>{title}</Text>
            <Ionicons name="chevron-forward" size={16} color={PPT.textSecondary} />
        </TouchableOpacity>
        {!isLast && <View style={styles.divider} />}
    </>
);

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        columnGap: 12,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        fontSize: PPT.font.body,
        color: PPT.textPrimary,
        fontWeight: '600',
    },
    dangerText: {
        color: PPT.danger,
    },
    divider: {
        height: 1,
        backgroundColor: PPT.cardBorder,
        marginLeft: 48,
    },
});

export default SettingsItem;
