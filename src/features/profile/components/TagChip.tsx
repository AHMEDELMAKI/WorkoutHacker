// src/features/profile/components/TagChip.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PPT } from './ProfileTheme';

interface Props {
    label: string;
    color?: string;
}

const TagChip: React.FC<Props> = ({ label, color = PPT.accent }) => (
    <View style={[styles.chip, { backgroundColor: color + '1A', borderColor: color + '44' }]}>
        <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    chip: {
        borderRadius: PPT.radius.full,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    text: {
        fontSize: PPT.font.label,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});

export default TagChip;
