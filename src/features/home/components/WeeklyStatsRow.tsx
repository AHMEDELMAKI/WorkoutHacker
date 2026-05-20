// File: src/features/home/components/WeeklyStatsRow.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import AppText from '../../../components/AppText';
import { Colors, Spacing, BorderRadius } from '../../../theme';
import type { StatItem } from '../data/homeData';

interface Props { stats: StatItem[]; }

const WeeklyStatsRow: React.FC<Props> = ({ stats }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <AppText variant="label" color={Colors.textSecondary}>This week</AppText>
        </View>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
        >
            {stats.map(stat => (
                <View key={stat.id} style={[styles.card, { borderColor: stat.color + '33' }]}>
                    <View style={[styles.iconCircle, { backgroundColor: stat.color + '22' }]}>
                        <AppText variant="body" align="center">{stat.icon}</AppText>
                    </View>
                    <View style={styles.valueLine}>
                        <AppText variant="h2" color={Colors.text}>{stat.value}</AppText>
                        <AppText variant="caption" color={Colors.textMuted}>{stat.unit}</AppText>
                    </View>
                    <AppText variant="caption" color={Colors.textSecondary}>{stat.label}</AppText>
                    <View style={[styles.deltaBadge, { backgroundColor: stat.deltaPositive ? Colors.success + '22' : Colors.error + '22' }]}>
                        <AppText
                            variant="caption"
                            color={stat.deltaPositive ? Colors.success : Colors.error}
                        >
                            {stat.delta} vs last week
                        </AppText>
                    </View>
                </View>
            ))}
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    section: { marginBottom: Spacing.xxl },
    sectionHeader: {
        paddingHorizontal: Spacing.xxl,
        marginBottom: Spacing.md,
    },
    row: {
        paddingHorizontal: Spacing.xxl,
        gap: Spacing.md,
    },
    card: {
        width: 140,
        backgroundColor: Colors.surfaceElevated,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.lg,
        gap: Spacing.sm,
    },
    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueLine: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    deltaBadge: {
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        alignSelf: 'flex-start',
    },
});

export default WeeklyStatsRow;