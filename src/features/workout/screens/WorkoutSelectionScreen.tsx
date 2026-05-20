// src/features/workout/screens/WorkoutSelectionScreen.tsx
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../../components/AppText';
import type { WorkoutStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import { workoutCategories } from '../data/workoutData';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutSelection'>;

const CategoryCard: React.FC<{
    emoji: string;
    title: string;
    duration: string;
    exerciseCount: number;
    accentColor: string;
    onPress: () => void;
}> = ({ emoji, title, duration, exerciseCount, accentColor, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const pressIn = () =>
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();
    const pressOut = () =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 60 }).start();

    return (
        <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={pressIn}
                onPressOut={pressOut}
                activeOpacity={1}
                style={styles.card}
            >
                <View style={[styles.emojiCircle, { backgroundColor: accentColor + '22' }]}>
                    <Text style={styles.emoji}>{emoji}</Text>
                </View>
                <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardSub}>
                        {duration} · {exerciseCount > 0 ? `${exerciseCount} exercises` : 'Custom'}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={accentColor} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const WorkoutSelectionScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
            <View style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerInner}>
                        <AppText variant="h2" color={WT.colors.textLight} style={styles.headerTitle}>
                            Choose Workout 💪
                        </AppText>
                        <AppText variant="body" color="rgba(255,255,255,0.80)">
                            Select your training focus
                        </AppText>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionLabel}>WORKOUT TYPES</Text>
                {workoutCategories.map(cat => (
                    <CategoryCard
                        key={cat.id}
                        emoji={cat.emoji}
                        title={cat.title}
                        duration={cat.duration}
                        exerciseCount={cat.exerciseCount}
                        accentColor={cat.accentColor}
                        onPress={() => navigation.navigate(cat.route)}
                    />
                ))}

                <Text style={[styles.sectionLabel, { marginTop: WT.spacing.lg }]}>TEST TOOLS</Text>
                <CategoryCard
                    emoji="👻"
                    title="Ghost Guide"
                    duration="Sample pose test"
                    exerciseCount={0}
                    accentColor="#7C5CFF"
                    onPress={() => navigation.navigate('GhostGuideTest')}
                />
                <CategoryCard
                    emoji="🎵"
                    title="Tempo Classifier"
                    duration="Native tempo bridge"
                    exerciseCount={0}
                    accentColor="#FF7A59"
                    onPress={() => navigation.navigate('TempoClassifierTest')}
                />
                <CategoryCard
                    emoji="🧠"
                    title="Workout Planner"
                    duration="Request normalizer"
                    exerciseCount={0}
                    accentColor="#28C4A6"
                    onPress={() => navigation.navigate('WorkoutPlannerTest')}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: WT.colors.background },
    header: {
        backgroundColor: WT.colors.header,
        borderBottomLeftRadius: WT.radius.lg,
        borderBottomRightRadius: WT.radius.lg,
        paddingHorizontal: WT.spacing.lg,
        paddingBottom: WT.spacing.lg,
        shadowColor: '#4A2878',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    headerInner: { paddingTop: WT.spacing.md },
    headerTitle: { fontWeight: '800', marginBottom: 4 },
    content: { padding: WT.spacing.lg, paddingTop: WT.spacing.xl },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: WT.colors.textMuted,
        letterSpacing: 1.2,
        marginBottom: WT.spacing.md,
    },
    cardWrap: { marginBottom: WT.spacing.md },
    card: {
        backgroundColor: WT.colors.card,
        borderRadius: WT.radius.md,
        borderWidth: 1,
        borderColor: WT.colors.cardBorder,
        padding: WT.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: WT.spacing.md,
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    emojiCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    emoji: { fontSize: 24 },
    cardText: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: '700', color: WT.colors.textDark, marginBottom: 3 },
    cardSub: { fontSize: 13, color: WT.colors.textMuted },
});

export default WorkoutSelectionScreen;
