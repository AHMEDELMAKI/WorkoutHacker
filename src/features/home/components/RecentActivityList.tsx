// File: src/features/home/components/RecentActivityList.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../../../components/AppText';
import { Colors, Spacing, BorderRadius } from '../../../theme';
import type { RecentActivity } from '../data/homeData';

interface Props { activities: RecentActivity[]; }

const RecentActivityList: React.FC<Props> = ({ activities }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <AppText variant="label" color={Colors.textSecondary}>Recent activity</AppText>
            <AppText variant="caption" color={Colors.primaryLight}>See all</AppText>
        </View>
        <View style={styles.list}>
            {activities.map((item, i) => (
                <View
                    key={item.id}
                    style={[styles.row, i < activities.length - 1 && styles.rowBorder]}
                >
                    <View style={styles.iconCircle}>
                        <AppText variant="body" align="center">{item.icon}</AppText>
                    </View>
                    <View style={styles.info}>
                        <AppText variant="label">{item.title}</AppText>
                        <AppText variant="caption" color={Colors.textMuted}>{item.date}</AppText>
                    </View>
                    <View style={styles.meta}>
                        <AppText variant="bodySmall" color={Colors.textSecondary}>{item.duration} min</AppText>
                        <AppText variant="caption" color={Colors.textMuted}>{item.calories} kcal</AppText>
                    </View>
                </View>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    section: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xxxl },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    list: {
        backgroundColor: Colors.surfaceElevated,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: { flex: 1, gap: 2 },
    meta: { alignItems: 'flex-end', gap: 2 },
});

export default RecentActivityList;