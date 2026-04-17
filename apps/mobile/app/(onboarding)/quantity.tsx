import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS = ['Type', 'Product', 'Quantity', 'Done'];

export default function QuantityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);

    await supabase
      .from('profiles')
      .update({ quantity })
      .eq('id', user.id);

    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id);

    setLoading(false);
    router.push('/(onboarding)/notifications');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        {/* Step Indicator */}
        <View style={styles.stepRow}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: i <= 2 ? colors.primary : colors.bgMuted,
                  },
                ]}
              >
                {i < 2 ? (
                  <Text style={[Typography.caption, { color: colors.textInverse }]}>✓</Text>
                ) : (
                  <Text
                    style={[
                      Typography.caption,
                      { color: i === 2 ? colors.textInverse : colors.textMuted },
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  Typography.caption,
                  {
                    color: i <= 2 ? colors.primary : colors.textMuted,
                    marginTop: 4,
                    fontWeight: i === 2 ? '600' : '400',
                  },
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Heading */}
        <View style={styles.heading}>
          <Text style={[Typography.h2, { color: colors.text }]}>How Many Do You Use?</Text>
          <Text style={[Typography.small, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            This helps us calculate your replacement schedule accurately.
          </Text>
        </View>

        {/* Quantity Stepper */}
        <View style={styles.stepperSection}>
          <Text style={[Typography.small, { color: colors.textSecondary, fontWeight: '500', marginBottom: Spacing.md }]}>
            Tubes replaced per cycle
          </Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperButton, { borderColor: colors.border }]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepperIcon, { color: colors.textSecondary }]}>−</Text>
            </TouchableOpacity>

            <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>

            <TouchableOpacity
              style={[styles.stepperButton, { borderColor: colors.border }]}
              onPress={() => setQuantity(Math.min(10, quantity + 1))}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepperIcon, { color: colors.textSecondary }]}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
            Most users replace {quantity === 1 ? '1 tube' : `${quantity} tubes`} every 30 days
          </Text>
        </View>

        {/* Info Box (conditional) */}
        {quantity > 1 && (
          <View style={[styles.infoBox, { backgroundColor: colors.infoBg }]}>
            <Text style={[Typography.small, { color: colors.info }]}>
              We'll track all <Text style={{ fontWeight: '700' }}>{quantity} tubes</Text> on the same
              30-day cycle for easy reordering.
            </Text>
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[Typography.bodyMedium, { color: colors.textInverse }]}>
                Continue to Dashboard →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  stepItem: { alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: { marginBottom: Spacing.xl },
  stepperSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 48,
    fontWeight: '700',
    width: 64,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  infoBox: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  ctaContainer: { marginTop: 'auto', paddingBottom: Spacing.xl },
  primaryButton: {
    borderRadius: Radii.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
});
