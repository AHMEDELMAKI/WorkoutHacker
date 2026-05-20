// src/features/profile/components/InfoRow.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PPT } from './ProfileTheme';

interface Props {
    label: string;
    value: string;
    isLast?: boolean;
}

const InfoRow: React.FC<Props> = ({ label, value, isLast = false }) => (
    <>
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
        {!isLast && <View style={styles.divider} />}
    </>
);

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    label: {
        fontSize: PPT.font.body,
        color: PPT.textSecondary,
        fontWeight: '500',
    },
    value: {
        fontSize: PPT.font.body,
        color: PPT.textPrimary,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: PPT.cardBorder,
    },
});

export default InfoRow;
