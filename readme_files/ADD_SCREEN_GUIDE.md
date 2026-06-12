# Developer Guide: Adding a Screen to the Workout Tab

This guide explains how to add a new workout screen or test tool to the **Workout** tab in WorkoutHacker.

## 1. Create the Screen Component

Create your new screen in `src/features/workout/screens/` (or a relevant feature folder). 

Ensure you use the project's design system:
- **Theme**: Import `WT` from `../../../theme/workoutTheme`.
- **Components**: Use `AppText` and `AppButton` instead of standard RN components.
- **Layout**: Follow the "Header + ScrollView + Card" pattern used in `GhostGuideTestScreen` or `TempoClassifierTestScreen`.

### Basic Template:
```tsx
import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WT } from '../../../theme/workoutTheme';
import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';

const MyNewWorkoutScreen: React.FC = () => {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <AppText variant="h2" color={WT.colors.textLight}>New Screen 🚀</AppText>
            <AppText variant="body" color="rgba(255,255,255,0.8)">Subtitle here</AppText>
          </View>
        </SafeAreaView>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <AppText variant="h3" color={WT.colors.textDark}>Content Title</AppText>
          <AppText variant="bodySmall" color={WT.colors.textMuted}>Description...</AppText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WT.colors.background },
  header: { backgroundColor: WT.colors.header, borderBottomLeftRadius: WT.radius.lg, borderBottomRightRadius: WT.radius.lg, padding: WT.spacing.lg, ...WT.shadow.card },
  headerInner: { paddingTop: WT.spacing.md },
  container: { padding: WT.spacing.lg },
  card: { backgroundColor: WT.colors.card, borderRadius: WT.radius.md, padding: WT.spacing.lg, ...WT.shadow.card },
});

export default MyNewWorkoutScreen;
```

## 2. Update Navigation Types

Add your new screen to the `WorkoutStackParamList` in `src/navigation/types.ts`.

```typescript
export type WorkoutStackParamList = {
    // ... existing screens
    MyNewWorkout: undefined; // Add this line
};
```

## 3. Register in Stack Navigator

Import and add the screen to `src/navigation/WorkoutStackNavigator.tsx`.

```tsx
import MyNewWorkoutScreen from '../features/workout/screens/MyNewWorkoutScreen';

// inside WorkoutStackNavigator component:
<Stack.Screen name="MyNewWorkout" component={MyNewWorkoutScreen} />
```

## 4. Add to Selection Screen

To make the screen accessible, add a trigger (e.g., a card) in `src/features/workout/screens/WorkoutSelectionScreen.tsx`.

```tsx
<CategoryCard
    emoji="🚀"
    title="My New Screen"
    duration="Description"
    exerciseCount={0}
    accentColor="#FF7A59"
    onPress={() => navigation.navigate('MyNewWorkout')}
/>
```

## Styling Checklist
- [ ] Uses `WT.colors` for all colors.
- [ ] Uses `WT.spacing` and `WT.radius` for consistent layout.
- [ ] Uses `AppText` with correct variants (`h1`, `h2`, `body`, `caption`).
- [ ] Includes a themed `StatusBar` and `SafeAreaView` header.
- [ ] Containers use standard padding (usually `WT.spacing.lg`).
- [ ] Interactive elements use `AppButton` or themed `TouchableOpacity`.
