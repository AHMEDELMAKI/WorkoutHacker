import React, { memo, useRef } from 'react';
import {
    Animated,
    NativeSyntheticEvent,
    StyleSheet,
    TextInput,
    TextInputKeyPressEventData,
    View,
} from 'react-native';
import { AuthColors } from './AuthColors';

interface OTPInputProps {
    value: string[];
    onChange: (values: string[]) => void;
    length?: number;
}

const BOX_SIZE = 58;

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, length = 4 }) => {
    const refs = useRef<(TextInput | null)[]>(Array(length).fill(null));
    const scaleAnims = useRef(
        Array.from({ length }, () => new Animated.Value(1)),
    ).current;

    const animateBox = (index: number, focused: boolean) => {
        Animated.spring(scaleAnims[index], {
            toValue: focused ? 1.08 : 1,
            useNativeDriver: true,
            speed: 40,
            bounciness: 6,
        }).start();
    };

    const handleChange = (text: string, index: number) => {
        // Paste: distribute across boxes
        if (text.length > 1) {
            const chars = text.replace(/\D/g, '').slice(0, length).split('');
            const next = [...value];
            chars.forEach((c, i) => {
                if (index + i < length) next[index + i] = c;
            });
            onChange(next);
            const lastIndex = Math.min(index + chars.length - 1, length - 1);
            refs.current[lastIndex]?.focus();
            return;
        }

        // Digits only
        const digit = text.replace(/\D/g, '');
        const next = [...value];
        next[index] = digit;
        onChange(next);

        if (digit && index < length - 1) {
            refs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number,
    ) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            const next = [...value];
            next[index - 1] = '';
            onChange(next);
            refs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.row}>
            {Array.from({ length }).map((_, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.boxWrap,
                        { transform: [{ scale: scaleAnims[i] }] },
                    ]}
                >
                    <TextInput
                        ref={(el) => {
                            refs.current[i] = el;
                        }}
                        style={[styles.box, !!value[i] && styles.boxFilled]}
                        value={value[i]}
                        onChangeText={(text) => handleChange(text, i)}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                        onFocus={() => animateBox(i, true)}
                        onBlur={() => animateBox(i, false)}
                        maxLength={length} // allows paste on first box
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        selectTextOnFocus
                        autoFocus={i === 0}
                        caretHidden
                    />
                </Animated.View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        columnGap: 14,
    },
    boxWrap: {
        width: BOX_SIZE,
        height: BOX_SIZE,
    },
    box: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: AuthColors.inputBorder,
        backgroundColor: AuthColors.inputBg,
        textAlign: 'center',
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    boxFilled: {
        borderColor: '#FFFFFF',
        borderWidth: 2,
        backgroundColor: 'rgba(255,255,255,0.22)',
    },
});

export default memo(OTPInput);
