import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Text style={[styles.logoText, { color: colors.textInverse }]}>O</Text>
        </View>

        {/* Illustration Circle */}
        <View style={[styles.illustrationCircle, { backgroundColor: colors.primary + '15' }]}>
          <Text style={styles.sparkle}>✨</Text>
        </View>

        {/* Copy */}
        <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: Spacing.lg }]}>
          Welcome to OxiSure
        </Text>

        <Text
          style={[
            Typography.body,
            {
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: Spacing.sm,
              paddingHorizontal: Spacing.lg,
            },
          ]}
        >
          We'll help you keep your oxygen tubing fresh and your replacements on schedule.
        </Text>

        <Text
          style={[
            Typography.caption,
            {
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: Spacing.sm,
            },
          ]}
        >
          This quick setup takes about 1 minute.
        </Text>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(onboarding)')}
            activeOpacity={0.85}
          >
            <Text style={[Typography.bodyMedium, { color: colors.textInverse }]}>
              Let's Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
  },
  illustrationCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    fontSize: 40,
  },
  ctaContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  primaryButton: {
    borderRadius: Radii.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
});
