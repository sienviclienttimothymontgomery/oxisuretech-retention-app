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
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import logoImage from '@/assets/images/logo.png';

type UserProfile = {
  id: string;
  user_type: string | null;
  product_sku: string | null;
  quantity: number | null;
  onboarding_completed: boolean | null;
  is_admin: boolean | null;
  created_at: string | null;
  email?: string;
  full_name?: string;
};

export default function AdminDashboardScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslate = useRef(new Animated.Value(20)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslate = useRef(new Animated.Value(30)).current;

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data as UserProfile[]);
    }
    if (error) {
      console.error('[Admin] Failed to fetch users:', error.message);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchUsers();
      setLoading(false);

      // Entrance animations
      Animated.stagger(150, [
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(statsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(statsTranslate, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(listOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(listTranslate, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
        ]),
      ]).start();
    };
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
        <Image
          source={logoImage}
          style={{ width: 200, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loaderText}>Loading admin panel...</Text>
      </View>
    );
  }

  // Stats
  const totalUsers = users.filter(u => !u.is_admin).length;
  const onboardedUsers = users.filter(u => !u.is_admin && u.onboarding_completed).length;
  const selfUsers = users.filter(u => u.user_type === 'self').length;
  const caregiverUsers = users.filter(u => u.user_type === 'caregiver').length;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.headerLeft}>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeIcon}>🛡️</Text>
              </View>
              <View>
                <Text style={styles.greeting}>Admin Panel</Text>
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

          {/* Stats */}
          <Animated.View
            style={[
              styles.statsGrid,
              {
                opacity: statsOpacity,
                transform: [{ translateY: statsTranslate }],
              },
            ]}
          >
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>👥</Text>
              <Text style={styles.statValue}>{totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statValue}>{onboardedUsers}</Text>
              <Text style={styles.statLabel}>Onboarded</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>👤</Text>
              <Text style={styles.statValue}>{selfUsers}</Text>
              <Text style={styles.statLabel}>Self Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🤝</Text>
              <Text style={styles.statValue}>{caregiverUsers}</Text>
              <Text style={styles.statLabel}>Caregivers</Text>
            </View>
          </Animated.View>

          {/* User List */}
          <Animated.View
            style={{
              opacity: listOpacity,
              transform: [{ translateY: listTranslate }],
            }}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Registered Users</Text>
              <TouchableOpacity onPress={handleRefresh} activeOpacity={0.7} style={styles.refreshBtn}>
                {refreshing ? (
                  <ActivityIndicator size="small" color="#0EA5E9" />
                ) : (
                  <Text style={styles.refreshText}>↻ Refresh</Text>
                )}
              </TouchableOpacity>
            </View>

            {users.filter(u => !u.is_admin).length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>No Users Yet</Text>
                <Text style={styles.emptyDesc}>
                  Users will appear here once they sign up and complete onboarding.
                </Text>
              </View>
            ) : (
              users
                .filter(u => !u.is_admin)
                .map((u) => (
                  <View key={u.id} style={styles.userCard}>
                    <View style={styles.userCardHeader}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                          {(u.full_name || u.email || u.id).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>
                          {u.full_name || u.email || u.id.substring(0, 8)}
                        </Text>
                        {u.email && <Text style={styles.userEmail}>{u.email}</Text>}
                      </View>
                      <View
                        style={[
                          styles.onboardingBadge,
                          {
                            backgroundColor: u.onboarding_completed
                              ? '#F0FDF4'
                              : '#FFFBEB',
                            borderColor: u.onboarding_completed
                              ? '#BBF7D0'
                              : '#FDE68A',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.onboardingBadgeText,
                            {
                              color: u.onboarding_completed
                                ? '#16A34A'
                                : '#D97706',
                            },
                          ]}
                        >
                          {u.onboarding_completed ? 'Active' : 'Pending'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userDetails}>
                      <View style={styles.userDetailItem}>
                        <Text style={styles.userDetailLabel}>Type</Text>
                        <Text style={styles.userDetailValue}>
                          {u.user_type === 'caregiver' ? '🤝 Caregiver' : u.user_type === 'self' ? '👤 Self' : '—'}
                        </Text>
                      </View>
                      <View style={styles.userDetailItem}>
                        <Text style={styles.userDetailLabel}>Product</Text>
                        <Text style={styles.userDetailValue}>
                          {u.product_sku || '—'}
                        </Text>
                      </View>
                      <View style={styles.userDetailItem}>
                        <Text style={styles.userDetailLabel}>Qty</Text>
                        <Text style={styles.userDetailValue}>
                          {u.quantity ?? '—'}
                        </Text>
                      </View>
                    </View>

                    {u.created_at && (
                      <Text style={styles.userJoined}>
                        Joined {new Date(u.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    )}
                  </View>
                ))
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 14,
    color: '#475569',
    marginTop: Spacing.md,
  },
  safeArea: { flex: 1 },
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
  adminBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBadgeIcon: {
    fontSize: 20,
  },
  greeting: {
    fontSize: 18,
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

  /* Stats */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  refreshBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0C5A8A',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },

  /* User Cards */
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  onboardingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  onboardingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  userDetails: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  userDetailItem: {
    flex: 1,
  },
  userDetailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  userDetailValue: {
    fontSize: 13,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  userJoined: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: Spacing.sm,
  },
});
