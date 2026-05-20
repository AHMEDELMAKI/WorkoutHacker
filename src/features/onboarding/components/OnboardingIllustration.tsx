// File: src/features/onboarding/components/OnboardingIllustration.tsx

import React from 'react';
import { Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
    image: any;
};

const OnboardingIllustration = ({ image }: Props) => {
    return (
        <Image
            source={image}
            style={{
                width: width * 0.82,
                aspectRatio: 1,
                maxHeight: width * 0.82,
            }}
            resizeMode="contain"
        />
    );
};

export default OnboardingIllustration;