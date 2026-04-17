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

export default function UserTypeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [userType, setUserType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!userType || !user) return;
    setLoading(true);

    await supabase
      .from('profiles')
      .upsert({ id: user.id, user_type: userType, path_type: 'app' });

    setLoading(false);
    router.push('/(onboarding)/confirm-product');
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
                    backgroundColor: i === 0 ? colors.primary : colors.bgMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.caption,
                    { color: i === 0 ? colors.textInverse : colors.textMuted },
                  ]}
                >
                  {i + 1}
                </Text>
              </View>
              <Text
                style={[
                  Typography.caption,
                  {
                    color: i === 0 ? colors.primary : colors.textMuted,
                    marginTop: 4,
                    fontWeight: i === 0 ? '600' : '400',
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
          <Text style={[Typography.h2, { color: colors.text }]}>Who is this for?</Text>
          <Text style={[Typography.small, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            This helps us set up the right experience for you.
          </Text>
        </View>

        {/* Radio Cards */}
        <View style={styles.cards}>
          <TouchableOpacity
            style={[
              styles.radioCard,
              {
                borderColor: userType === 'self' ? colors.primary : colors.border,
                backgroundColor: userType === 'self' ? colors.bgSubtle : colors.surface,
              },
            ]}
            onPress={() => setUserType('self')}
            activeOpacity={0.85}
          >
            <View style={styles.radioCardContent}>
              <View
                style={[
                  styles.radioIcon,
                  { backgroundColor: userType === 'self' ? colors.primary : colors.bgMuted },
                ]}
              >
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
              <View style={styles.radioCardText}>
                <Text style={[Typography.bodyMedium, { color: colors.text }]}>Just for me</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  I use oxygen tubing and want to track my own replacements.
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radioOuter,
                { borderColor: userType === 'self' ? colors.primary : colors.border },
              ]}
            >
              {userType === 'self' && (
                <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.radioCard,
              {
                borderColor: userType === 'caregiver' ? colors.primary : colors.border,
                backgroundColor: userType === 'caregiver' ? colors.bgSubtle : colors.surface,
              },
            ]}
            onPress={() => setUserType('caregiver')}
            activeOpacity={0.85}
          >
            <View style={styles.radioCardContent}>
              <View
                style={[
                  styles.radioIcon,
                  { backgroundColor: userType === 'caregiver' ? colors.primary : colors.bgMuted },
                ]}
              >
                <Text style={{ fontSize: 18 }}>👥</Text>
              </View>
              <View style={styles.radioCardText}>
                <Text style={[Typography.bodyMedium, { color: colors.text }]}>I'm a caregiver</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  I help manage supplies for one or more people who use oxygen.
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radioOuter,
                { borderColor: userType === 'caregiver' ? colors.primary : colors.border },
              ]}
            >
              {userType === 'caregiver' && (
                <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: userType ? colors.primary : colors.bgMuted,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleContinue}
            disabled={!userType || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text
                style={[
                  Typography.bodyMedium,
                  { color: userType ? colors.textInverse : colors.textMuted },
                ]}
              >
                Continue →
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
  heading: { marginBottom: Spacing.lg },
  cards: { gap: Spacing.md },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  radioCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  radioIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCardText: { flex: 1 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
