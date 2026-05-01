import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Colors, Spacing, Radii, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import logoImage from '@/assets/images/logo.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const featureOpacity = useRef(new Animated.Value(0)).current;
  const featureTranslate = useRef(new Animated.Value(30)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslate = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(200, [
      // Logo bounce in
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Title fade + slide
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      // Subtitle
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Features
      Animated.parallel([
        Animated.timing(featureOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(featureTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      // CTA
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ctaTranslate, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Logo glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const features = [
    { emoji: '📦', title: 'Track Replacements', desc: 'Know exactly when your supplies are due' },
    { emoji: '🔔', title: 'Smart Reminders', desc: 'Never miss a replacement cycle again' },
    { emoji: '💰', title: 'Easy Reordering', desc: 'One-tap reorder with exclusive discounts' },
  ];

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoArea, { transform: [{ scale: logoScale }] }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image
              source={logoImage}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          }}
        >
          <Text style={styles.title}>Welcome</Text>
        </Animated.View>

        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.subtitle}>
            Keep your oxygen tubing fresh and your replacements on schedule.
          </Text>
        </Animated.View>

        {/* Feature Cards */}
        <Animated.View
          style={[
            styles.featureList,
            {
              opacity: featureOpacity,
              transform: [{ translateY: featureTranslate }],
            },
          ]}
        >
          {features.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View
          style={[
            styles.ctaContainer,
            {
              opacity: ctaOpacity,
              transform: [{ translateY: ctaTranslate }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigate('/(onboarding)')}
            activeOpacity={0.85}
          >
            <View
              style={[styles.primaryButtonGradient, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.primaryButtonText}>Let's Get Started</Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.setupTime}>⏱ This quick setup takes about 1 minute</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },

  /* Orbs */
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.08,
  },
  orbTopRight: {
    width: 300,
    height: 300,
    backgroundColor: '#38BDF8',
    top: -80,
    right: -80,
  },
  orbBottomLeft: {
    width: 250,
    height: 250,
    backgroundColor: '#0EA5E9',
    bottom: -60,
    left: -100,
  },

  /* Logo */
  logoArea: {
    marginBottom: Spacing.md,
  },
  logoImage: {
    width: 200,
    height: 120,
  },

  /* Typography */
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A2E',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },

  /* Feature Cards */
  featureList: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md, // 12px
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radii.sm,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 22,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },

  /* CTA */
  ctaContainer: {
    width: '100%',
    marginTop: 'auto',
  },
  primaryButton: {
    borderRadius: Radii.sm, // 8px
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  primaryButtonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  setupTime: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
