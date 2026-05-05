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
import { LinearGradient } from 'expo-linear-gradient';
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
  const ctaGlowAnim = useRef(new Animated.Value(0.15)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(featureOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(featureTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ctaTranslate, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Logo glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ]),
    ).start();

    // CTA button glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaGlowAnim, { toValue: 0.35, duration: 1500, useNativeDriver: true }),
        Animated.timing(ctaGlowAnim, { toValue: 0.15, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();

    // Background orbs
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 7000, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 0, duration: 7000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const orbTranslateY = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  const features = [
    { emoji: '📦', title: 'Track Replacements', desc: 'Know exactly when your supplies are due', accentColor: '#0EA5E9' },
    { emoji: '🔔', title: 'Smart Reminders', desc: 'Never miss a replacement cycle again', accentColor: '#8B5CF6' },
    { emoji: '💰', title: 'Easy Reordering', desc: 'One-tap reorder with exclusive discounts', accentColor: '#10B981' },
  ];

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      {/* Floating Orbs */}
      <Animated.View
        style={[styles.orb, styles.orbTopRight, { transform: [{ translateY: orbTranslateY }] }]}
      />
      <Animated.View
        style={[styles.orb, styles.orbBottomLeft, { transform: [{ translateY: Animated.multiply(orbTranslateY, -1) }] }]}
      />

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
              <View style={[styles.featureAccentBar, { backgroundColor: f.accentColor }]} />
              <View style={[styles.featureIconContainer, { backgroundColor: f.accentColor + '12' }]}>
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
            <LinearGradient
              colors={['#38BDF8', '#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Let's Get Started</Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </LinearGradient>
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
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orbTopRight: {
    width: 280,
    height: 280,
    backgroundColor: '#38BDF8',
    opacity: 0.04,
    top: -80,
    right: -80,
  },
  orbBottomLeft: {
    width: 220,
    height: 220,
    backgroundColor: '#0EA5E9',
    opacity: 0.05,
    bottom: -60,
    left: -90,
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
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Inter',
    color: '#1A1A2E',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },

  /* Feature Cards */
  featureList: {
    width: '100%',
    gap: Spacing.sm + 2,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    paddingHorizontal: Spacing.md,
    paddingLeft: 0,
    gap: Spacing.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  featureAccentBar: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    marginRight: Spacing.sm,
  },
  featureIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    fontWeight: '700',
    fontFamily: 'Inter',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#64748B',
    lineHeight: 18,
  },

  /* CTA */
  ctaContainer: {
    width: '100%',
    marginTop: 'auto',
  },
  primaryButton: {
    borderRadius: Radii.md,
    overflow: 'hidden',
    ...Shadows.glow('#0EA5E9'),
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    gap: Spacing.sm,
    borderRadius: Radii.md,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
