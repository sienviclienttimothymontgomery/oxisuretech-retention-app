import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Browser } from '@capacitor/browser';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import logoImage from '@/assets/images/logo.png';

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

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslate = useRef(new Animated.Value(30)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;

  const daysLeft = MOCK_DAYS_LEFT;
  const status = getStatusConfig(daysLeft, colors);
  const progress = Math.max(0, Math.min(1, daysLeft / CYCLE_DAYS));

  const handleReorder = async () => {
    const url = 'https://oxisuretechsolutions.com/products/oxygen-tubing-50-ft-non-kinking-high-flow-hose';
    try {
      await Browser.open({ url });
    } catch (err) {
      console.error('[Dashboard] Failed to open reorder URL:', err);
    }
  };

  // Ring dimensions
  const ringSize = 200;
  const strokeWidth = 14;
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

      // Entrance animations after data loads
      Animated.stagger(150, [
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.parallel([
          Animated.spring(ringScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(cardsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(cardsTranslate, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
        ]),
      ]).start();
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
        <Image
          source={logoImage}
          style={{ width: 200, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  const isCaregiver = profile?.user_type === 'caregiver';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <LinearGradient
                  colors={['#38BDF8', '#0EA5E9']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>{avatarInitial}</Text>
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
                <Text style={styles.email}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={signOut}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Caregiver Toggle */}
          {isCaregiver && (
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  viewMode === 'self' && styles.segmentActive,
                ]}
                onPress={() => setViewMode('self')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    viewMode === 'self' && styles.segmentTextActive,
                  ]}
                >
                  My Tracker
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  viewMode === 'caregiver' && styles.segmentActive,
                ]}
                onPress={() => setViewMode('caregiver')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    viewMode === 'caregiver' && styles.segmentTextActive,
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
              <Animated.View
                style={[
                  styles.ringContainer,
                  {
                    transform: [{ scale: ringScale }],
                    opacity: ringOpacity,
                  },
                ]}
              >
                <View style={styles.ringGlassCard}>
                  <Svg width={ringSize} height={ringSize} style={styles.ringSvg}>
                    {/* Background ring */}
                    <Circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      stroke="#E2E8F0"
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
                    <Text style={styles.ringLabel}>days left</Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
                  <Text style={{ fontSize: 16 }}>{status.emoji}</Text>
                  <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                  <Text style={[styles.statusSub, { color: status.color }]}>
                    Next replacement in {daysLeft} days
                  </Text>
                </View>
              </Animated.View>

              {/* Action Cards */}
              <Animated.View
                style={{
                  opacity: cardsOpacity,
                  transform: [{ translateY: cardsTranslate }],
                }}
              >
                {/* Reorder CTA */}
                <TouchableOpacity style={styles.reorderCard} activeOpacity={0.85} onPress={handleReorder}>
                  <LinearGradient
                    colors={['#0EA5E9', '#0284C7', '#0369A1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.reorderGradient}
                  >
                    <View style={styles.reorderContent}>
                      <View style={styles.reorderBadge}>
                        <Text style={styles.reorderBadgeText}>🎉 SAVE 10%</Text>
                      </View>
                      <Text style={styles.reorderTitle}>Ready to Reorder?</Text>
                      <Text style={styles.reorderSub}>
                        Get your replacement supplies with an early reorder discount
                      </Text>
                      <View style={styles.reorderButton}>
                        <Text style={styles.reorderButtonText}>Order Now →</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Detail Cards */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Text style={{ fontSize: 24 }}>🫁</Text>
                    </View>
                    <Text style={styles.detailTitle}>Product</Text>
                    <Text style={styles.detailValue}>
                      {profile?.product_sku || 'OXI-TUB-07'}
                    </Text>
                    <Text style={styles.detailMuted}>
                      Qty: {profile?.quantity || 1}
                    </Text>
                  </View>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Text style={{ fontSize: 24 }}>🔔</Text>
                    </View>
                    <Text style={styles.detailTitle}>Reminders</Text>
                    <Text style={[styles.detailValue, { color: '#4ADE80' }]}>
                      Push: Active
                    </Text>
                    <Text style={[styles.detailMuted, { color: '#4ADE80' }]}>
                      Email: Active
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </>
          ) : (
            /* Caregiver View */
            <Animated.View
              style={[
                styles.caregiverView,
                {
                  opacity: cardsOpacity,
                  transform: [{ translateY: cardsTranslate }],
                },
              ]}
            >
              <View style={styles.caregiverCard}>
                <View style={styles.caregiverAvatar}>
                  <Text style={{ fontSize: 20 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.caregiverName}>Mom</Text>
                  <Text style={styles.caregiverRole}>Parent</Text>
                </View>
                <View style={styles.miniStatus}>
                  <View style={[styles.miniDot, { backgroundColor: '#4ADE80' }]} />
                  <Text style={[styles.miniStatusText, { color: '#4ADE80' }]}>On Track</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.addDependentBtn} activeOpacity={0.7}>
                <Text style={styles.addDependentText}>+ Add Another Person</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },

  /* Orbs */
  orbContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 9999, opacity: 0.06 },
  orbTopRight: { width: 300, height: 300, backgroundColor: '#38BDF8', top: -100, right: -100 },
  orbBottomLeft: { width: 250, height: 250, backgroundColor: '#0EA5E9', bottom: -80, left: -100 },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  email: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  signOutText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },

  /* Segmented Control */
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: Radii.sm,
    padding: 3,
    marginBottom: Spacing.lg,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radii.sm - 2,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  segmentTextActive: {
    fontWeight: '600',
    color: '#0C5A8A',
  },

  /* Ring */
  ringContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ringGlassCard: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
    ...Shadows.sm,
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
    color: '#1A1A2E',
  },
  ringLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },

  /* Status Badge */
  statusBadge: {
    borderRadius: Radii.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSub: {
    fontSize: 13,
    opacity: 0.8,
  },

  /* Reorder CTA */
  reorderCard: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  reorderGradient: {
    borderRadius: Radii.lg,
  },
  reorderContent: {
    padding: Spacing.lg,
  },
  reorderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radii.full,
    marginBottom: Spacing.sm,
  },
  reorderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  reorderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reorderSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  reorderButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.sm,
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Detail Cards */
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  detailCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radii.sm,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  detailMuted: {
    fontSize: 13,
    color: '#94A3B8',
  },

  /* Caregiver View */
  caregiverView: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  caregiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  caregiverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  caregiverRole: {
    fontSize: 13,
    color: '#475569',
  },
  miniStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    gap: 4,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addDependentBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#0EA5E9',
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
  },
  addDependentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C5A8A',
  },
});
