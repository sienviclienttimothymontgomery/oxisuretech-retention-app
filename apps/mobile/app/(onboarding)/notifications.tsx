import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS = ['Type', 'Product', 'Quantity', 'Alerts'];

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const bothOff = !pushEnabled && !emailEnabled;

  const handleComplete = () => {
    // In production: persist notification preferences & request push permission
    router.replace('/(app)/dashboard');
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
                  { backgroundColor: colors.primary },
                ]}
              >
                {i < 3 ? (
                  <Text style={[Typography.caption, { color: colors.textInverse }]}>✓</Text>
                ) : (
                  <Text style={[Typography.caption, { color: colors.textInverse }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  Typography.caption,
                  {
                    color: colors.primary,
                    marginTop: 4,
                    fontWeight: i === 3 ? '600' : '400',
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
          <Text style={[Typography.h2, { color: colors.text }]}>Stay on Schedule</Text>
          <Text style={[Typography.small, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            Choose how you'd like to be reminded when it's time to replace your tubing.
          </Text>
        </View>

        {/* Toggle Cards */}
        <View style={styles.cards}>
          {/* Push */}
          <View style={[styles.toggleCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={[styles.toggleIcon, { backgroundColor: colors.primary + '15' }]}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
            </View>
            <View style={styles.toggleText}>
              <Text style={[Typography.bodyMedium, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                Get alerted directly on your phone
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              ios_backgroundColor={colors.border}
            />
          </View>

          {/* Email */}
          <View style={[styles.toggleCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={[styles.toggleIcon, { backgroundColor: colors.accent + '15' }]}>
              <Text style={{ fontSize: 20 }}>📧</Text>
            </View>
            <View style={styles.toggleText}>
              <Text style={[Typography.bodyMedium, { color: colors.text }]}>Email Reminders</Text>
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                Receive reminders in your inbox
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* Warning */}
        {bothOff && (
          <View style={[styles.warningBox, { backgroundColor: colors.warningBg }]}>
            <Text style={[Typography.small, { color: colors.warning }]}>
              Without reminders, you'll need to check back manually. We recommend enabling at least one.
            </Text>
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
            <Text style={[Typography.bodyMedium, { color: colors.textInverse }]}>
              Complete Setup →
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
  cards: { gap: Spacing.md },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: { flex: 1 },
  warningBox: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
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
