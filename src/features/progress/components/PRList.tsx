// File: src/features/progress/components/PRList.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PersonalRecord } from '../data/progressData';
import { PT } from './ProgressTheme';

interface Props { records: PersonalRecord[] }

const PRCard: React.FC<{ pr: PersonalRecord }> = ({ pr }) => (
    <TouchableOpacity
        style={[styles.card, { borderColor: pr.color + '33' }]}
        activeOpacity={0.80}
        accessibilityLabel={`${pr.exercise}: ${pr.value}`}
    >
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: pr.color + '1A' }]}>
            <Text style={styles.icon}>{pr.icon}</Text>
        </View>

        {/* Value */}
        <Text style={[styles.value, { color: pr.color }]}>{pr.value}</Text>
        <Text style={styles.exercise}>{pr.exercise}</Text>
        <Text style={styles.date}>{pr.date}</Text>

        {/* PR Badge */}
        <View style={[styles.prBadge, { backgroundColor: pr.color + '18' }]}>
            <Text style={[styles.prBadgeText, { color: pr.color }]}>🏆 PR</Text>
        </View>
    </TouchableOpacity>
);

const PRList: React.FC<Props> = ({ records }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <Text style={styles.allTime}>All time</Text>
        </View>
        <View style={styles.grid}>
            {records.map(pr => (
                <PRCard key={pr.id} pr={pr} />
            ))}
        </View>
    </View>
);

const { spacing: S, radius: R, font: F } = PT;

const styles = StyleSheet.create({
    section: {
        marginHorizontal: S.lg,
        marginBottom: S.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: S.sm,
    },
    sectionTitle: {
        fontSize: F.label,
        fontWeight: '700',
        color: PT.textWhite,
        letterSpacing: 0.2,
    },
    allTime: {
        fontSize: F.micro,
        color: PT.textWhiteSoft,
        fontWeight: '500',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: 10,
        rowGap: 10,
    },
    card: {
        width: '47.5%',
        backgroundColor: PT.cardBg,
        borderRadius: R.lg,
        borderWidth: 1.5,
        padding: S.md,
        rowGap: 3,
        shadowColor: PT.cardShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    icon: { fontSize: 22 },
    value: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    exercise: {
        fontSize: F.label,
        fontWeight: '600',
        color: PT.textPrimary,
    },
    date: {
        fontSize: F.micro,
        color: PT.textMuted,
        fontWeight: '400',
    },
    prBadge: {
        marginTop: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: R.full,
    },
    prBadgeText: {
        fontSize: F.micro,
        fontWeight: '700',
    },
});

export default PRList;