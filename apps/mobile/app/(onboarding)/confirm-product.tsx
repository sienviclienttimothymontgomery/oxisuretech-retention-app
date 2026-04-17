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

export default function ConfirmProductScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);

    await supabase
      .from('profiles')
      .update({ product_sku: 'OXI-TUB-07' })
      .eq('id', user.id);

    setLoading(false);
    router.push('/(onboarding)/quantity');
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
                    backgroundColor:
                      i <= 1 ? colors.primary : colors.bgMuted,
                  },
                ]}
              >
                {i < 1 ? (
                  <Text style={[Typography.caption, { color: colors.textInverse }]}>✓</Text>
                ) : (
                  <Text
                    style={[
                      Typography.caption,
                      { color: i === 1 ? colors.textInverse : colors.textMuted },
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
                    color: i <= 1 ? colors.primary : colors.textMuted,
                    marginTop: 4,
                    fontWeight: i === 1 ? '600' : '400',
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
          <Text style={[Typography.h2, { color: colors.text }]}>Confirm Your Product</Text>
          <Text style={[Typography.small, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            We detected this product from your purchase. Is this correct?
          </Text>
        </View>

        {/* Product Card */}
        <View style={[styles.productCard, { borderColor: colors.primary, backgroundColor: colors.bgSubtle }]}>
          <View style={[styles.productIcon, { backgroundColor: colors.primary }]}>
            <Text style={{ fontSize: 28 }}>🫁</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={[Typography.bodyMedium, { color: colors.text }]}>OxiSure Oxygen Tubing</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              Standard 7ft Nasal Cannula
            </Text>
          </View>
          <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
            <Text style={{ color: colors.textInverse, fontSize: 14, fontWeight: '700' }}>✓</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.infoBg }]}>
          <Text style={[Typography.small, { color: colors.info, fontWeight: '500' }]}>
            Recommended replacement cycle: <Text style={{ fontWeight: '700' }}>Every 30 days</Text>
          </Text>
          <Text style={[Typography.caption, { color: colors.info, opacity: 0.7, marginTop: 4 }]}>
            Based on medical guidelines for continuous-use oxygen tubing.
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[Typography.bodyMedium, { color: colors.textInverse }]}>
                Yes, This Is Correct →
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ghostButton]}
            activeOpacity={0.7}
          >
            <Text style={[Typography.small, { color: colors.textSecondary }]}>
              This isn't my product
            </Text>
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
  heading: { marginBottom: Spacing.lg },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  productIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: { flex: 1 },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  ctaContainer: { marginTop: 'auto', paddingBottom: Spacing.xl, gap: Spacing.md },
  primaryButton: {
    borderRadius: Radii.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  ghostButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
