// File: src/features/onboarding/components/PaginationDots.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PaginationDotsProps {
    count: number;
    activeIndex: number;
}


const PaginationDots: React.FC<PaginationDotsProps> = ({ count, activeIndex }) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i === activeIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 22,
        backgroundColor: '#875BA4',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: '#C8B4D6',
    },
});

export default PaginationDots;
