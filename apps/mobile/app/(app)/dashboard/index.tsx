import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Profile = {
  user_type: string | null;
  path_type: string | null;
  product_sku: string | null;
  quantity: number | null;
  onboarding_completed: boolean | null;
};

// Simulated data for demo
const MOCK_DAYS_LEFT = 22;
const CYCLE_DAYS = 30;

function getStatusConfig(daysLeft: number, colors: typeof Colors.light) {
  if (daysLeft > 7)
    return { color: colors.success, bg: colors.successBg, label: 'On Track', emoji: '✅' };
  if (daysLeft > 0)
    return { color: colors.warning, bg: colors.warningBg, label: 'Due Soon', emoji: '⚠️' };
  return { color: colors.danger, bg: colors.dangerBg, label: 'Overdue', emoji: '🔴' };
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'self' | 'caregiver'>('self');

  const daysLeft = MOCK_DAYS_LEFT;
  const status = getStatusConfig(daysLeft, colors);
  const progress = Math.max(0, Math.min(1, daysLeft / CYCLE_DAYS));

  // Ring dimensions
  const ringSize = 200;
  const strokeWidth = 12;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data as Profile | null);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isCaregiver = profile?.user_type === 'caregiver';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[Typography.h2, { color: colors.text }]}>Dashboard</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.signOutBtn, { borderColor: colors.border }]}
            onPress={signOut}
            activeOpacity={0.7}
          >
            <Text style={[Typography.caption, { color: colors.danger, fontWeight: '600' }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Caregiver Toggle */}
        {isCaregiver && (
          <View style={[styles.segmentedControl, { backgroundColor: colors.bgMuted }]}>
            <TouchableOpacity
              style={[
                styles.segment,
                viewMode === 'self' && { backgroundColor: colors.surface },
              ]}
              onPress={() => setViewMode('self')}
            >
              <Text
                style={[
                  Typography.small,
                  {
                    color: viewMode === 'self' ? colors.primary : colors.textMuted,
                    fontWeight: viewMode === 'self' ? '600' : '400',
                  },
                ]}
              >
                My Tracker
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segment,
                viewMode === 'caregiver' && { backgroundColor: colors.surface },
              ]}
              onPress={() => setViewMode('caregiver')}
            >
              <Text
                style={[
                  Typography.small,
                  {
                    color: viewMode === 'caregiver' ? colors.primary : colors.textMuted,
                    fontWeight: viewMode === 'caregiver' ? '600' : '400',
                  },
                ]}
              >
                People I Manage
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {viewMode === 'self' ? (
          <>
            {/* Status Ring */}
            <View style={styles.ringContainer}>
              <Svg width={ringSize} height={ringSize} style={styles.ringSvg}>
                {/* Background ring */}
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke={colors.bgMuted}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress ring */}
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke={status.color}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${ringSize / 2}, ${ringSize / 2}`}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={[styles.ringDays, { color: status.color }]}>{daysLeft}</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>days left</Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={{ fontSize: 16 }}>{status.emoji}</Text>
              <Text style={[Typography.bodyMedium, { color: status.color }]}>{status.label}</Text>
              <Text style={[Typography.caption, { color: status.color, opacity: 0.8 }]}>
                Next replacement in {daysLeft} days
              </Text>
            </View>

            {/* Reorder CTA */}
            <TouchableOpacity
              style={[styles.reorderCard]}
              activeOpacity={0.85}
            >
              <View style={styles.reorderGradient}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, borderRadius: Radii.md }]} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primaryLight, borderRadius: Radii.md, opacity: 0.4 }]} />
              </View>
              <View style={styles.reorderContent}>
                <Text style={[Typography.h3, { color: colors.textInverse }]}>Ready to Reorder?</Text>
                <Text style={[Typography.small, { color: colors.textInverse, opacity: 0.85, marginTop: 4 }]}>
                  10% Off — Early Reorder
                </Text>
                <View style={[styles.reorderButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[Typography.label, { color: colors.textInverse }]}>
                    Order Now →
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Details Cards */}
            <View style={styles.detailsRow}>
              <View style={[styles.detailCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={{ fontSize: 24, marginBottom: Spacing.sm }}>🫁</Text>
                <Text style={[Typography.label, { color: colors.text }]}>Product</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  {profile?.product_sku || 'OXI-TUB-07'}
                </Text>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  Qty: {profile?.quantity || 1}
                </Text>
              </View>
              <View style={[styles.detailCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={{ fontSize: 24, marginBottom: Spacing.sm }}>🔔</Text>
                <Text style={[Typography.label, { color: colors.text }]}>Reminders</Text>
                <Text style={[Typography.caption, { color: colors.success, marginTop: 2 }]}>
                  Push: Active
                </Text>
                <Text style={[Typography.caption, { color: colors.success }]}>
                  Email: Active
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* Caregiver View */
          <View style={styles.caregiverView}>
            <View style={[styles.caregiverCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={[styles.caregiverAvatar, { backgroundColor: colors.primary + '20' }]}>
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.bodyMedium, { color: colors.text }]}>Mom</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Parent</Text>
              </View>
              <View style={[styles.miniStatus, { backgroundColor: colors.successBg }]}>
                <View style={[styles.miniDot, { backgroundColor: colors.success }]} />
                <Text style={[Typography.caption, { color: colors.success, fontWeight: '500' }]}>
                  On Track
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addDependentBtn, { borderColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Text style={[Typography.bodyMedium, { color: colors.primary }]}>
                + Add Another Person
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  signOutBtn: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: Radii.sm,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radii.sm - 2,
    alignItems: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    height: 200,
  },
  ringSvg: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDays: {
    fontSize: 48,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.lg,
  },
  reorderCard: {
    borderRadius: Radii.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  reorderGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  reorderContent: {
    padding: Spacing.lg,
    zIndex: 1,
  },
  reorderButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.sm,
    marginTop: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  detailCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  caregiverView: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  caregiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  caregiverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 4,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addDependentBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
});
