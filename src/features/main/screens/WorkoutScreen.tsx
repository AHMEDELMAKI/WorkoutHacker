import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../../components/AppText';
import { Colors, Spacing, BorderRadius } from '../../../theme';
import type { MainTabParamList } from '../../../navigation/types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<MainTabParamList, 'Workout'>;

const WorkoutScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <AppText variant="h1">Workouts</AppText>
                    <AppText variant="body" color={Colors.textSecondary}>Choose your challenge</AppText>
                </View>

                {['Strength', 'Cardio', 'Flexibility'].map(category => (
                    <View key={category} style={styles.categorySection}>
                        <AppText variant="h3" style={styles.categoryTitle}>{category}</AppText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {[1, 2, 3].map(i => (
                                <TouchableOpacity key={i} style={styles.workoutCard}>
                                    <View style={styles.thumbnail}>
                                        <AppText>🏃‍♂️</AppText>
                                    </View>
                                    <AppText variant="body" bold>Advanced {category}</AppText>
                                    <AppText variant="caption">30 mins</AppText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.lg,
    },
    header: {
        marginVertical: Spacing.xl,
    },
    categorySection: {
        marginBottom: Spacing.xl,
    },
    categoryTitle: {
        marginBottom: Spacing.md,
    },
    horizontalScroll: {
        marginHorizontal: -Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    workoutCard: {
        width: 160,
        marginRight: Spacing.md,
    },
    thumbnail: {
        width: '100%',
        height: 100,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});

export default WorkoutScreen;
