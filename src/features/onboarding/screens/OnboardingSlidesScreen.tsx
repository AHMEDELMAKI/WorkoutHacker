// File: src/features/onboarding/screens/OnboardingSlidesScreen.tsx

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../navigation/types';
import OnboardingIllustration from '../components/OnboardingIllustration';
import PaginationDots from '../components/PaginationDots';
import { ONBOARDING_SLIDES } from '../data/slides';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: W } = Dimensions.get('window');
const SLIDES = ONBOARDING_SLIDES;
const TOTAL = SLIDES.length;

const PRIMARY = '#875BA4';
const PRIMARY_LIGHT = '#A88FB6';

const OnboardingSlidesScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / W);
      setCurrent(idx);
    },
    [],
  );

  const goNext = () => {
    if (current < TOTAL - 1) {
      const next = current + 1;
      scrollRef.current?.scrollTo({ x: next * W, animated: true });
      setCurrent(next);
    }
  };

  const goToAuth = () => navigation.replace('Auth');
  const goToSetup = () => navigation.replace('ProfileSetup');

  const isLast = current === TOTAL - 1;
  const slide = SLIDES[current];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        bounces={false}
        decelerationRate="fast"
        style={styles.slideScroll}
        contentContainerStyle={{ width: W * TOTAL }}
      >
        {SLIDES.map((s) => (
          <View key={s.id} style={[styles.slide, { width: W }]}>
            <View style={[styles.topSection, { paddingTop: insets.top + 24 }]}>

              <Text style={styles.slideTitle}>{s.title}</Text>

              <View style={styles.illustrationWrapper}>
                <OnboardingIllustration image={s.image} />
              </View>

            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Card */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 16 }]}>

        {/* Subtitle (hidden in last screen) */}
        {slide.subtitle ? (
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        ) : null}

        {/* Dots */}
        {!isLast && (
          <View style={styles.dotsRow}>
            <PaginationDots count={TOTAL} activeIndex={current} />
          </View>
        )}

        {/* Buttons */}
        {isLast ? (
          <View style={styles.ctaRow}>
            <TouchableOpacity
              onPress={goToSetup}
              activeOpacity={0.85}
              style={styles.getStartedBtn}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToAuth}
              activeOpacity={0.85}
              style={styles.loginBtn}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.85}
            style={styles.nextBtn}
          >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  slideScroll: {
    flex: 1,
  },

  slide: {
    flex: 1,
  },

  topSection: {
    flex: 1,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  slideTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 30,
  },

  // 👇 مهم: يخلي الصورة أقرب للتصميم
  illustrationWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 20,
  },

  // Bottom card
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 28,
    paddingHorizontal: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },

  subtitle: {
    color: '#4A4C6A',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  dotsRow: {
    marginBottom: 20,
    alignItems: 'center',
  },

  nextBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  ctaRow: {
    flexDirection: 'row',
    gap: 14,
  },

  getStartedBtn: {
    flex: 1,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  getStartedText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  loginBtn: {
    flex: 1,
    borderRadius: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PRIMARY_LIGHT,
  },

  loginText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default OnboardingSlidesScreen;