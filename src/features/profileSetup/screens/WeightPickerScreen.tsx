import React, { useRef } from 'react';
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { ProfileSetupStackScreenProps } from '../../../navigation/types';
import { SetupTheme as T } from '../components/SetupTheme';
import SetupWrapper from '../components/SetupWrapper';
import { useProfileSetup } from '../context/ProfileSetupContext';

type Props = ProfileSetupStackScreenProps<'Weight'>;

const MIN_KG = 30;
const MAX_KG = 200;
const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;

const WEIGHTS = Array.from({ length: MAX_KG - MIN_KG + 1 }, (_, i) => MIN_KG + i);

const WeightPickerScreen: React.FC<Props> = ({ navigation }) => {
    const { profile, setWeight } = useProfileSetup();
    const listRef = useRef<FlatList>(null);
    const selectedKg = profile.weightKg;
    const lbs = Math.round(selectedKg * 2.2046);

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(WEIGHTS.length - 1, index));
        setWeight(WEIGHTS[clamped]);
    };

    return (
        <SetupWrapper
            step={4}
            title="What's Your Weight?"
            subtitle="Used to estimate calorie burn and workout load."
            onBack={() => navigation.goBack()}
            onContinue={() => navigation.navigate('Goals')}
        >
            <View style={styles.wrapper}>
                {/* Display */}
                <View style={styles.displayRow}>
                    <View style={styles.displayBlock}>
                        <Text style={styles.displayValue}>{selectedKg}</Text>
                        <Text style={styles.displayUnit}>kg</Text>
                    </View>
                    <Text style={styles.displaySep}>/</Text>
                    <View style={styles.displayBlock}>
                        <Text style={styles.displayValue}>{lbs}</Text>
                        <Text style={styles.displayUnit}>lbs</Text>
                    </View>
                </View>

                {/* Picker */}
                <View style={[styles.pickerContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                    <View
                        style={[
                            styles.indicator,
                            { top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2), height: ITEM_HEIGHT },
                        ]}
                        pointerEvents="none"
                    />
                    <FlatList
                        ref={listRef}
                        data={WEIGHTS}
                        keyExtractor={(item) => String(item)}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onMomentumScrollEnd={onScrollEnd}
                        onScrollEndDrag={onScrollEnd}
                        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        initialScrollIndex={selectedKg - MIN_KG}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }}
                        renderItem={({ item }) => {
                            const diff = Math.abs(item - selectedKg);
                            return (
                                <View style={[styles.item, { height: ITEM_HEIGHT }]}>
                                    <Text
                                        style={[
                                            styles.itemText,
                                            diff === 0 && styles.itemSelected,
                                            diff === 1 && styles.itemNear,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </View>
                            );
                        }}
                    />
                </View>
            </View>
        </SetupWrapper>
    );
};

const { spacing: S, font: F } = T;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        paddingTop: S.lg,
    },
    displayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: S.xl,
        columnGap: 16,
    },
    displayBlock: { alignItems: 'center' },
    displaySep: { fontSize: 32, color: T.textMuted, fontWeight: '300' },
    displayValue: {
        fontSize: 56,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 64,
    },
    displayUnit: {
        fontSize: F.label,
        fontWeight: '600',
        color: T.textSecondary,
    },
    pickerContainer: {
        width: 160,
        overflow: 'hidden',
        position: 'relative',
    },
    indicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderTopWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: T.pickerLine,
        backgroundColor: 'rgba(255,255,255,0.06)',
        zIndex: 1,
    },
    item: { alignItems: 'center', justifyContent: 'center' },
    itemText: { fontSize: F.body, fontWeight: '500', color: T.textMuted },
    itemSelected: { fontSize: F.picker, fontWeight: '800', color: '#FFFFFF' },
    itemNear: { fontSize: 22, fontWeight: '600', color: T.textSecondary },
});

export default WeightPickerScreen;
