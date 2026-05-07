import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Image,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import logoImage from '@/assets/images/logo.png';

type UserProfile = {
  id: string; user_type: string | null; product_sku: string | null;
  quantity: number | null; onboarding_completed: boolean | null;
  is_admin: boolean | null; created_at: string | null; email?: string; full_name?: string;
};

export default function AdminDashboardScreen() {
  const { user, signOut } = useAuth();
  const colors = Colors[useColorScheme() ?? 'light'];
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const headerOp = useRef(new Animated.Value(0)).current;
  const statsOp = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(20)).current;
  const listOp = useRef(new Animated.Value(0)).current;
  const listY = useRef(new Animated.Value(30)).current;

  const fetchUsers = async () => {
    setFetchError(null);
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    console.log('[ADMIN] Fetch profiles result:', {
      rowCount: data?.length ?? 0,
      exactCount: count,
      error: error?.message ?? 'none',
      userTypes: data?.map(u => u.user_type),
      adminFlags: data?.map(u => u.is_admin),
    });

    if (error) {
      console.error('[ADMIN] Supabase error:', error);
      setFetchError(error.message);
    }
    if (data) setUsers(data as UserProfile[]);
  };

  useEffect(() => {
    (async () => {
      await fetchUsers(); setLoading(false);
      Animated.stagger(150, [
        Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.parallel([Animated.timing(statsOp, { toValue: 1, duration: 400, useNativeDriver: true }), Animated.spring(statsY, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true })]),
        Animated.parallel([Animated.timing(listOp, { toValue: 1, duration: 400, useNativeDriver: true }), Animated.spring(listY, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true })]),
      ]).start();
    })();
  }, []);

  if (loading) return (
    <View style={s.loader}><View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      <Image source={logoImage} style={{ width: 200, height: 120, marginBottom: 20 }} resizeMode="contain" />
      <ActivityIndicator size="large" color="#0EA5E9" /><Text style={s.loaderText}>Loading admin panel...</Text>
    </View>
  );

  const nonAdmin = users.filter(u => !u.is_admin);
  const total = nonAdmin.length;
  const onboarded = nonAdmin.filter(u => u.onboarding_completed).length;
  const selfU = users.filter(u => u.user_type === 'self').length;
  const careU = users.filter(u => u.user_type === 'caregiver').length;

  const stats = [
    { emoji: '👥', value: total, label: 'Total Users' },
    { emoji: '✅', value: onboarded, label: 'Onboarded' },
    { emoji: '👤', value: selfU, label: 'Self Users' },
    { emoji: '🤝', value: careU, label: 'Caregivers' },
  ];

  return (
    <View style={s.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      <View style={[s.orb, s.orbTR]} /><View style={[s.orb, s.orbBL]} />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[s.header, { opacity: headerOp }]}>
            <View style={s.headerLeft}>
              <View style={s.adminBadge}><Text style={{ fontSize: 20 }}>🛡️</Text></View>
              <View><Text style={s.greeting}>Admin Panel</Text><Text style={s.email}>{user?.email}</Text></View>
            </View>
            <TouchableOpacity style={s.signOutBtn} onPress={signOut} activeOpacity={0.7}>
              <Text style={s.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>

          {fetchError && (
            <View style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626', fontFamily: 'Inter' }}>⚠️ Database Error</Text>
              <Text style={{ fontSize: 12, color: '#991B1B', fontFamily: 'Inter', marginTop: 4 }}>{fetchError}</Text>
            </View>
          )}
          {!fetchError && users.length <= 1 && (
            <View style={{ backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#D97706', fontFamily: 'Inter' }}>⚠️ Only {users.length} profile(s) returned</Text>
              <Text style={{ fontSize: 12, color: '#92400E', fontFamily: 'Inter', marginTop: 4 }}>
                This usually means the admin RLS migration hasn't been applied yet. Please run the SQL from the admin migration in your Supabase SQL Editor.
              </Text>
            </View>
          )}

          <Animated.View style={[s.statsGrid, { opacity: statsOp, transform: [{ translateY: statsY }] }]}>
            {stats.map(st => (
              <View key={st.label} style={s.statCard}>
                <Text style={{ fontSize: 24, marginBottom: Spacing.xs }}>{st.emoji}</Text>
                <Text style={s.statValue}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={{ opacity: listOp, transform: [{ translateY: listY }] }}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Registered Users</Text>
              <TouchableOpacity onPress={async () => { setRefreshing(true); await fetchUsers(); setRefreshing(false); }} activeOpacity={0.7} style={s.refreshBtn}>
                {refreshing ? <ActivityIndicator size="small" color="#0EA5E9" /> : <Text style={s.refreshText}>↻ Refresh</Text>}
              </TouchableOpacity>
            </View>

            {nonAdmin.length === 0 ? (
              <View style={s.empty}><Text style={{ fontSize: 40, marginBottom: Spacing.md }}>📭</Text><Text style={s.emptyTitle}>No Users Yet</Text><Text style={s.emptyDesc}>Users will appear here once they sign up and complete onboarding.</Text></View>
            ) : nonAdmin.map(u => (
              <View key={u.id} style={s.userCard}>
                <View style={s.userCardHeader}>
                  <View style={s.userAvatar}><Text style={s.userAvatarText}>{(u.full_name || u.email || u.id).charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userName}>{u.full_name || u.email || u.id.substring(0, 8)}</Text>
                    {u.email && <Text style={s.userEmail}>{u.email}</Text>}
                  </View>
                  <View style={[s.obBadge, { backgroundColor: u.onboarding_completed ? '#F0FDF4' : '#FFFBEB', borderColor: u.onboarding_completed ? '#BBF7D0' : '#FDE68A' }]}>
                    <Text style={[s.obBadgeText, { color: u.onboarding_completed ? '#16A34A' : '#D97706' }]}>{u.onboarding_completed ? 'Active' : 'Pending'}</Text>
                  </View>
                </View>
                <View style={s.userDetails}>
                  {[['Type', u.user_type === 'caregiver' ? '🤝 Caregiver' : u.user_type === 'self' ? '👤 Self' : '—'], ['Product', u.product_sku || '—'], ['Qty', u.quantity ?? '—']].map(([l, v]) => (
                    <View key={l as string} style={s.userDetailItem}><Text style={s.userDetailLabel}>{l}</Text><Text style={s.userDetailValue}>{v}</Text></View>
                  ))}
                </View>
                {u.created_at && <Text style={s.userJoined}>Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>}
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 }, loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { fontSize: 14, fontFamily: 'Inter', color: '#475569', marginTop: Spacing.md },
  safe: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 9999 },
  orbTR: { width: 280, height: 280, backgroundColor: '#38BDF8', opacity: 0.04, top: -100, right: -100 },
  orbBL: { width: 220, height: 220, backgroundColor: '#0EA5E9', opacity: 0.05, bottom: -80, left: -100 },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  adminBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F9FF', borderWidth: 2, borderColor: '#0EA5E9', justifyContent: 'center', alignItems: 'center', ...Shadows.glow('#0EA5E9') },
  greeting: { fontSize: 20, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E' },
  email: { fontSize: 12, fontFamily: 'Inter', color: '#475569', marginTop: 1 },
  signOutBtn: { borderWidth: 1, borderColor: '#FECACA', borderRadius: Radii.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#FEF2F2' },
  signOutText: { fontSize: 13, fontFamily: 'Inter', color: '#DC2626', fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#FFF', borderRadius: Radii.lg, borderWidth: 1, borderColor: '#E2E8F0', padding: Spacing.md, alignItems: 'center', ...Shadows.md },
  statValue: { fontSize: 30, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12, fontFamily: 'Inter', color: '#475569', fontWeight: '500', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E' },
  refreshBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.sm, backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD' },
  refreshText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter', color: '#0C5A8A' },

  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, backgroundColor: '#FFF', borderRadius: Radii.lg, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E', marginBottom: Spacing.xs },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter', color: '#64748B', textAlign: 'center', paddingHorizontal: Spacing.xl, lineHeight: 20 },

  userCard: { backgroundColor: '#FFF', borderRadius: Radii.lg, borderWidth: 1, borderColor: '#E2E8F0', padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.md },
  userCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  userAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0EA5E9', justifyContent: 'center', alignItems: 'center', ...Shadows.sm },
  userAvatarText: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#FFF' },
  userName: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E' },
  userEmail: { fontSize: 12, fontFamily: 'Inter', color: '#64748B', marginTop: 1 },
  obBadge: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 3, borderRadius: Radii.full, borderWidth: 1 },
  obBadgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter' },
  userDetails: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: Radii.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, gap: Spacing.lg },
  userDetailItem: { flex: 1 },
  userDetailLabel: { fontSize: 11, fontFamily: 'Inter', color: '#94A3B8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  userDetailValue: { fontSize: 13, fontFamily: 'Inter', color: '#1A1A2E', fontWeight: '600' },
  userJoined: { fontSize: 11, fontFamily: 'Inter', color: '#94A3B8', marginTop: Spacing.sm },
});
