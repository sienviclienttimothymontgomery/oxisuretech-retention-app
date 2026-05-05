import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Browser } from '@capacitor/browser';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import logoImage from '@/assets/images/logo.png';

type Profile = {
  user_type: string | null; path_type: string | null; product_sku: string | null;
  quantity: number | null; onboarding_completed: boolean | null;
  notifications_push: boolean | null; notifications_email: boolean | null; created_at: string | null;
};

const CYCLE_DAYS = 30;
function computeTimeLeft(createdAt: string | null) {
  if (!createdAt) return { value: CYCLE_DAYS, label: 'days left', isHours: false, rawDays: CYCLE_DAYS };
  
  const elapsedMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const cycleMs = CYCLE_DAYS * 86400000;
  const msLeft = cycleMs - (elapsedMs % cycleMs);
  
  const hoursLeft = Math.ceil(msLeft / 3600000);
  
  if (hoursLeft <= 48) {
    return { 
      value: hoursLeft, 
      label: hoursLeft === 1 ? 'hour left' : 'hours left', 
      isHours: true, 
      rawDays: Math.ceil(hoursLeft / 24) 
    };
  }
  
  const daysLeft = Math.ceil(hoursLeft / 24);
  return { 
    value: daysLeft, 
    label: 'days left', 
    isHours: false, 
    rawDays: daysLeft 
  };
}

function getStatusConfig(rawDays: number) {
  if (rawDays > 7) return { color: '#16A34A', label: 'On Track', emoji: '✅' };
  if (rawDays > 0) return { color: '#D97706', label: 'Due Soon', emoji: '⚠️' };
  return { color: '#DC2626', label: 'Overdue', emoji: '🔴' };
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const colors = Colors[useColorScheme() ?? 'light'];
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'self' | 'caregiver'>('self');

  const headerOp = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOp = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(30)).current;
  const cardsOp = useRef(new Animated.Value(0)).current;

  const timeLeft = computeTimeLeft(profile?.created_at ?? null);
  const status = getStatusConfig(timeLeft.rawDays);
  const progress = Math.max(0, Math.min(1, timeLeft.rawDays / CYCLE_DAYS));
  const nextDate = (() => { const d = new Date(); d.setDate(d.getDate() + timeLeft.rawDays); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })();

  const ringSize = 200, sw = 14, r = (ringSize - sw) / 2;
  const circ = 2 * Math.PI * r, dashOff = circ * (1 - progress);

  const handleReorder = async () => {
    try { await Browser.open({ url: 'https://oxisuretechsolutions.com/products/oxygen-tubing-50-ft-non-kinking-high-flow-hose' }); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data as Profile | null);
      setLoading(false);
      Animated.stagger(150, [
        Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.parallel([
          Animated.spring(ringScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
          Animated.timing(ringOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(cardsOp, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(cardsY, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
        ]),
      ]).start();
    })();
  }, [user]);

  if (loading) return (
    <View style={s.loader}><View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      <Image source={logoImage} style={{ width: 200, height: 120, marginBottom: 20 }} resizeMode="contain" />
      <ActivityIndicator size="large" color="#0EA5E9" />
    </View>
  );

  const isCaregiver = profile?.user_type === 'caregiver';
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const firstName = fullName.split(' ')[0];
  const avatarInitial = fullName.charAt(0).toUpperCase();

  return (
    <View style={s.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      <View style={[s.orb, s.orbTR]} /><View style={[s.orb, s.orbBL]} />

      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={[s.header, { opacity: headerOp }]}>
            <View style={s.headerLeft}>
              <View style={s.avatar}>
                <LinearGradient colors={['#38BDF8', '#0284C7']} style={s.avatarGrad}>
                  <Text style={s.avatarText}>{avatarInitial}</Text>
                </LinearGradient>
              </View>
              <View style={s.headerInfo}>
                <Text style={s.greeting} numberOfLines={1}>Hello, {firstName} 👋</Text>
                <Text style={s.email} numberOfLines={1}>{user?.email}</Text>
              </View>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity style={s.settingsBtn} onPress={() => navigate('/(app)/settings')} activeOpacity={0.7}>
                <Text style={{ fontSize: 18 }}>⚙️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.signOutBtn} onPress={signOut} activeOpacity={0.7}>
                <Text style={s.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Caregiver Toggle */}
          {isCaregiver && (
            <View style={s.segControl}>
              {['self', 'caregiver'].map(m => (
                <TouchableOpacity key={m} style={[s.seg, viewMode === m && s.segActive]} onPress={() => setViewMode(m as any)}>
                  <Text style={[s.segText, viewMode === m && s.segTextActive]}>{m === 'self' ? 'My Tracker' : 'People I Manage'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {viewMode === 'self' ? (<>
            {/* Status Ring */}
            <Animated.View style={[s.ringContainer, { transform: [{ scale: ringScale }], opacity: ringOp }]}>
              <View style={s.ringCard}>
                <Svg width={ringSize} height={ringSize} style={s.ringSvg}>
                  <Circle cx={ringSize/2} cy={ringSize/2} r={r} stroke="#E2E8F0" strokeWidth={sw} fill="transparent" />
                  <Circle cx={ringSize/2} cy={ringSize/2} r={r} stroke={status.color} strokeWidth={sw} fill="transparent"
                    strokeDasharray={`${circ}`} strokeDashoffset={dashOff} strokeLinecap="round" rotation="-90" origin={`${ringSize/2}, ${ringSize/2}`} />
                </Svg>
                <View style={s.ringCenter}>
                  <Text style={[s.ringDays, { color: status.color }]}>{timeLeft.value}</Text>
                  <Text style={s.ringLabel}>{timeLeft.label}</Text>
                </View>
              </View>
              <View style={[s.statusBadge, { backgroundColor: status.color + '14', borderColor: status.color + '30' }]}>
                <Text style={{ fontSize: 16 }}>{status.emoji}</Text>
                <Text style={[s.statusLabel, { color: status.color }]}>{status.label}</Text>
                <Text style={[s.statusSub, { color: status.color }]}>Next replacement on {nextDate}</Text>
              </View>
            </Animated.View>

            {/* Cards */}
            <Animated.View style={{ opacity: cardsOp, transform: [{ translateY: cardsY }] }}>
              {/* Reorder CTA */}
              <TouchableOpacity style={s.reorderCard} activeOpacity={0.85} onPress={handleReorder}>
                <LinearGradient colors={['#0EA5E9', '#0284C7', '#0369A1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.reorderGrad}>
                  <View style={s.reorderContent}>
                    <View style={s.reorderBadge}><Text style={s.reorderBadgeText}>🎉 SAVE 10%</Text></View>
                    <Text style={s.reorderTitle}>Ready to Reorder?</Text>
                    <Text style={s.reorderSub}>Get your replacement supplies with an early reorder discount</Text>
                    <View style={s.reorderButton}><Text style={s.reorderButtonText}>Order Now →</Text></View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Detail Cards */}
              <View style={s.detailsRow}>
                <View style={s.detailCard}>
                  <View style={[s.detailIconC, { backgroundColor: '#0EA5E9' + '12' }]}><Text style={{ fontSize: 24 }}>🫁</Text></View>
                  <Text style={s.detailTitle}>Product</Text>
                  <Text style={s.detailValue}>{profile?.product_sku || 'Standard Tubing'}</Text>
                  <Text style={s.detailMuted}>Qty: {profile?.quantity || 1}</Text>
                </View>
                <View style={s.detailCard}>
                  <View style={[s.detailIconC, { backgroundColor: '#8B5CF6' + '12' }]}><Text style={{ fontSize: 24 }}>🔔</Text></View>
                  <Text style={s.detailTitle}>Reminders</Text>
                  <Text style={[s.detailValue, { color: profile?.notifications_push !== false ? '#16A34A' : '#94A3B8' }]}>
                    Push: {profile?.notifications_push !== false ? 'Active' : 'Off'}
                  </Text>
                  <Text style={[s.detailMuted, { color: profile?.notifications_email !== false ? '#16A34A' : '#94A3B8' }]}>
                    Email: {profile?.notifications_email !== false ? 'Active' : 'Off'}
                  </Text>
                </View>
              </View>

              {/* Tracker Details */}
              <View style={s.trackerSection}>
                <Text style={s.trackerSTitle}>Tracker Details</Text>
                <View style={s.trackerCard}>
                  {[
                    ['Account', user?.email || '—'],
                    ['Workspace', profile?.path_type || 'App'],
                    ['Product SKU', profile?.product_sku || 'Standard Tubing'],
                    ['Next Replacement', nextDate],
                    ['Quantity', `${profile?.quantity || 1} Tube(s)`],
                  ].map(([label, value], i) => (
                    <View key={label} style={[s.trackerRow, i > 0 && s.trackerRowBorder]}>
                      <Text style={s.trackerLabel}>{label}</Text>
                      {['Workspace', 'Product SKU', 'Quantity'].includes(label as string) ? (
                        <View style={s.trackerBadge}><Text style={s.trackerBadgeText}>{value}</Text></View>
                      ) : (
                        <Text style={s.trackerValue} numberOfLines={1}>{value}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          </>) : (
            <Animated.View style={[s.caregiverView, { opacity: cardsOp, transform: [{ translateY: cardsY }] }]}>
              <View style={s.caregiverCard}>
                <View style={s.caregiverAvatar}><Text style={{ fontSize: 20 }}>👤</Text></View>
                <View style={{ flex: 1 }}><Text style={s.caregiverName}>Mom</Text><Text style={s.caregiverRole}>Parent</Text></View>
                <View style={s.miniStatus}><View style={[s.miniDot, { backgroundColor: '#16A34A' }]} /><Text style={[s.miniStatusText, { color: '#16A34A' }]}>On Track</Text></View>
              </View>
              <TouchableOpacity style={s.addBtn} activeOpacity={0.7}><Text style={s.addBtnText}>+ Add Another Person</Text></TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 }, loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }, safe: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 9999 },
  orbTR: { width: 280, height: 280, backgroundColor: '#38BDF8', opacity: 0.04, top: -100, right: -100 },
  orbBL: { width: 220, height: 220, backgroundColor: '#0EA5E9', opacity: 0.05, bottom: -80, left: -100 },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1, flexShrink: 1, marginRight: Spacing.sm },
  headerInfo: { flex: 1, flexShrink: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', flexShrink: 0, ...Shadows.glow('#0EA5E9') },
  avatarGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', fontFamily: 'Inter', color: '#FFF' },
  greeting: { fontSize: 17, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E' },
  email: { fontSize: 12, fontFamily: 'Inter', color: '#475569', marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  settingsBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', ...Shadows.sm },
  signOutBtn: { borderWidth: 1, borderColor: '#FECACA', borderRadius: Radii.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#FEF2F2' },
  signOutText: { fontSize: 13, fontFamily: 'Inter', color: '#DC2626', fontWeight: '600' },

  segControl: { flexDirection: 'row', borderRadius: Radii.md, padding: 3, marginBottom: Spacing.lg, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  seg: { flex: 1, paddingVertical: 10, borderRadius: Radii.sm, alignItems: 'center' },
  segActive: { backgroundColor: '#FFF', ...Shadows.sm },
  segText: { fontSize: 14, fontWeight: '500', fontFamily: 'Inter', color: '#475569' },
  segTextActive: { fontWeight: '700', color: '#0C5A8A' },

  ringContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  ringCard: { width: 224, height: 224, borderRadius: 112, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: Spacing.md, ...Shadows.md },
  ringSvg: { position: 'absolute' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringDays: { fontSize: 48, fontWeight: '800', fontFamily: 'Inter', fontVariant: ['tabular-nums'] },
  ringLabel: { fontSize: 14, fontFamily: 'Inter', color: '#475569', fontWeight: '500' },

  statusBadge: { borderRadius: Radii.lg, paddingVertical: 10, paddingHorizontal: Spacing.lg, alignItems: 'center', gap: 2, borderWidth: 1 },
  statusLabel: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter' },
  statusSub: { fontSize: 13, fontFamily: 'Inter', opacity: 0.8 },

  reorderCard: { borderRadius: Radii.xl, overflow: 'hidden', marginBottom: Spacing.lg, ...Shadows.xl },
  reorderGrad: { borderRadius: Radii.xl },
  reorderContent: { padding: Spacing.lg },
  reorderBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.sm + 4, paddingVertical: 5, borderRadius: Radii.full, marginBottom: Spacing.sm },
  reorderBadgeText: { fontSize: 11, fontWeight: '700', fontFamily: 'Inter', color: '#FFF', letterSpacing: 0.5 },
  reorderTitle: { fontSize: 21, fontWeight: '800', fontFamily: 'Inter', color: '#FFF', marginBottom: 4 },
  reorderSub: { fontSize: 14, fontFamily: 'Inter', color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  reorderButton: { alignSelf: 'flex-start', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 4, borderRadius: Radii.sm, marginTop: Spacing.md, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  reorderButtonText: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter', color: '#FFF' },

  detailsRow: { flexDirection: 'row', gap: Spacing.md },
  detailCard: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center', ...Shadows.md },
  detailIconC: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  detailTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E', marginBottom: 2 },
  detailValue: { fontSize: 13, fontFamily: 'Inter', color: '#475569', marginTop: 2 },
  detailMuted: { fontSize: 13, fontFamily: 'Inter', color: '#94A3B8' },

  trackerSection: { marginTop: Spacing.lg },
  trackerSTitle: { fontSize: 13, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.md, paddingLeft: 2 },
  trackerCard: { backgroundColor: '#FFF', borderRadius: Radii.lg, borderWidth: 1, borderColor: '#E2E8F0', padding: Spacing.md, ...Shadows.sm },
  trackerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  trackerRowBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: Spacing.sm, paddingTop: Spacing.md },
  trackerLabel: { fontSize: 14, fontFamily: 'Inter', color: '#475569', fontWeight: '500' },
  trackerValue: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#1A1A2E', maxWidth: 200 },
  trackerBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radii.full },
  trackerBadgeText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter', color: '#1A1A2E', textTransform: 'capitalize' },

  caregiverView: { gap: Spacing.md, marginTop: Spacing.md },
  caregiverCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', borderRadius: Radii.lg, padding: Spacing.md, gap: Spacing.md, ...Shadows.md },
  caregiverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },
  caregiverName: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#1A1A2E' },
  caregiverRole: { fontSize: 13, fontFamily: 'Inter', color: '#475569' },
  miniStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radii.full, backgroundColor: 'rgba(22, 163, 74, 0.1)', gap: 4 },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  miniStatusText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  addBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#0EA5E9', borderRadius: Radii.lg, paddingVertical: Spacing.md, alignItems: 'center', backgroundColor: '#F0F9FF' },
  addBtnText: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#0C5A8A' },
});
