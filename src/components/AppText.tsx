import React from 'react';
import {
    Text,
    StyleSheet,
    TextProps,
    TextStyle
} from 'react-native';
import { Colors, FontSizes, FontWeights } from '../theme';

type Variant =
    | 'display'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'button';

interface AppTextProps extends TextProps {
    variant?: Variant;
    color?: string;
    bold?: boolean;
    center?: boolean;
}

const AppText: React.FC<AppTextProps> = ({
    variant = 'body',
    color,
    bold,
    center,
    style,
    children,
    ...props
}) => {
    return (
        <Text
            style={[
                styles.base,
                (styles as any)[variant],
                color ? { color } : undefined,
                bold ? styles.bold : undefined,
                center ? styles.center : undefined,
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    base: {
        color: Colors.text,
        fontSize: FontSizes.md,
        fontWeight: FontWeights.regular,
    },
    bold: {
        fontWeight: FontWeights.bold,
    },
    center: {
        textAlign: 'center',
    },
    display: {
        fontSize: FontSizes.display,
        fontWeight: FontWeights.extraBold,
        letterSpacing: -1,
        lineHeight: 46,
    },
    h1: {
        fontSize: FontSizes.xxxl,
        fontWeight: FontWeights.bold,
        lineHeight: 38,
    },
    h2: {
        fontSize: FontSizes.xxl,
        fontWeight: FontWeights.bold,
        lineHeight: 32,
    },
    h3: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.semiBold,
        lineHeight: 28,
    },
    body: {
        fontSize: FontSizes.md,
        lineHeight: 22,
    },
    bodySmall: {
        fontSize: FontSizes.sm,
        lineHeight: 18,
    },
    caption: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        lineHeight: 16,
    },
    button: {
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semiBold,
        lineHeight: 20,
    },
});

export default AppText;
