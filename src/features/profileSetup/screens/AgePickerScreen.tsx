import React, { useCallback, useRef } from 'react';
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    View
} from 'react-native';
import type { ProfileSetupStackScreenProps } from '../../../navigation/types';
import { SetupTheme as T } from '../components/SetupTheme';
import SetupWrapper from '../components/SetupWrapper';
import { useProfileSetup } from '../context/ProfileSetupContext';

type Props = ProfileSetupStackScreenProps<'Age'>;

const MIN_AGE = 12;
const MAX_AGE = 90;
const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

interface AgeItemProps {
    value: number;
    selected: boolean;
    nearSelected: boolean;
}

const AgeItem: React.FC<AgeItemProps> = ({ value, selected, nearSelected }) => (
    <View style={[styles.item, { height: ITEM_HEIGHT }]}>
        <Text
            style={[
                styles.itemText,
                selected && styles.itemTextSelected,
                nearSelected && !selected && styles.itemTextNear,
                !selected && !nearSelected && styles.itemTextFar,
            ]}
        >
            {value}
        </Text>
    </View>
);

const AgePickerScreen: React.FC<Props> = ({ navigation }) => {
    const { profile, setAge } = useProfileSetup();
    const listRef = useRef<FlatList>(null);
    const selectedAge = profile.age;

    const scrollToAge = useCallback((age: number) => {
        const index = age - MIN_AGE;
        listRef.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: true });
    }, []);

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(AGES.length - 1, index));
        setAge(AGES[clamped]);
    };

    return (
        <SetupWrapper
            step={2}
            title="How Old Are You?"
            subtitle="Your age helps us set the right intensity for your workouts."
            onBack={() => navigation.goBack()}
            onContinue={() => navigation.navigate('Height')}
        >
            <View style={styles.wrapper}>
                {/* Value display */}
                <View style={styles.displayRow}>
                    <Text style={styles.displayValue}>{selectedAge}</Text>
                    <Text style={styles.displayUnit}>yrs</Text>
                </View>

                {/* Picker container */}
                <View style={[styles.pickerContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                    {/* Indicator lines */}
                    <View
                        style={[
                            styles.indicator,
                            {
                                top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                                height: ITEM_HEIGHT,
                            },
                        ]}
                        pointerEvents="none"
                    />

                    <FlatList
                        ref={listRef}
                        data={AGES}
                        keyExtractor={(item) => String(item)}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onMomentumScrollEnd={onScrollEnd}
                        onScrollEndDrag={onScrollEnd}
                        getItemLayout={(_, index) => ({
                            length: ITEM_HEIGHT,
                            offset: ITEM_HEIGHT * index,
                            index,
                        })}
                        initialScrollIndex={selectedAge - MIN_AGE}
                        contentContainerStyle={{
                            paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                        }}
                        renderItem={({ item }) => (
                            <AgeItem
                                value={item}
                                selected={item === selectedAge}
                                nearSelected={Math.abs(item - selectedAge) === 1}
                            />
                        )}
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
        alignItems: 'flex-end',
        marginBottom: S.xl,
    },
    displayValue: {
        fontSize: 72,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 80,
    },
    displayUnit: {
        fontSize: 22,
        fontWeight: '600',
        color: T.textSecondary,
        marginBottom: 10,
        marginLeft: 8,
    },
    pickerContainer: {
        width: 180,
        position: 'relative',
        overflow: 'hidden',
    },
    indicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderTopWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: T.pickerLine,
        zIndex: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemText: {
        fontSize: F.body,
        fontWeight: '500',
        color: T.textMuted,
    },
    itemTextSelected: {
        fontSize: F.picker,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    itemTextNear: {
        fontSize: 22,
        fontWeight: '600',
        color: T.textSecondary,
    },
    itemTextFar: {},
});

export default AgePickerScreen;
