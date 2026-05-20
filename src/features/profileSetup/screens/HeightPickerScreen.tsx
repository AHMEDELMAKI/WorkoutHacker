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

type Props = ProfileSetupStackScreenProps<'Height'>;

const MIN_CM = 130;
const MAX_CM = 220;
const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;

const HEIGHTS = Array.from({ length: MAX_CM - MIN_CM + 1 }, (_, i) => MIN_CM + i);

const HeightPickerScreen: React.FC<Props> = ({ navigation }) => {
    const { profile, setHeight } = useProfileSetup();
    const listRef = useRef<FlatList>(null);
    const selectedCm = profile.heightCm;

    // Convert cm to feet + inches for display
    const totalInches = selectedCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(HEIGHTS.length - 1, index));
        setHeight(HEIGHTS[clamped]);
    };

    return (
        <SetupWrapper
            step={3}
            title="What's Your Height?"
            subtitle="Used to calculate BMI and optimal workout intensity."
            onBack={() => navigation.goBack()}
            onContinue={() => navigation.navigate('Weight')}
        >
            <View style={styles.wrapper}>
                {/* Display */}
                <View style={styles.displayRow}>
                    <View style={styles.displayBlock}>
                        <Text style={styles.displayValue}>{selectedCm}</Text>
                        <Text style={styles.displayUnit}>cm</Text>
                    </View>
                    <Text style={styles.displaySep}>/</Text>
                    <View style={styles.displayBlock}>
                        <Text style={styles.displayValue}>{feet}'{inches}"</Text>
                        <Text style={styles.displayUnit}>ft</Text>
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
                        data={HEIGHTS}
                        keyExtractor={(item) => String(item)}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onMomentumScrollEnd={onScrollEnd}
                        onScrollEndDrag={onScrollEnd}
                        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        initialScrollIndex={selectedCm - MIN_CM}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }}
                        renderItem={({ item }) => {
                            const diff = Math.abs(item - selectedCm);
                            return (
                                <View style={[styles.item, { height: ITEM_HEIGHT }]}>
                                    <Text
                                        style={[
                                            styles.itemText,
                                            diff === 0 && styles.itemSelected,
                                            diff === 1 && styles.itemNear,
                                            diff > 1 && styles.itemFar,
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
    displaySep: {
        fontSize: 32,
        color: T.textMuted,
        fontWeight: '300',
    },
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
    itemFar: {},
});

export default HeightPickerScreen;
