import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Image, RefreshControl, TextInput, Alert, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Browser } from '@capacitor/browser';
import { buildCartUrl, getDiscountTier, SHOPIFY_CONFIG } from '@/lib/shopify';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import logoImage from '@/assets/images/logo.png';

type Profile = {
  user_type: string | null; path_type: string | null; product_sku: string | null;
  quantity: number | null; onboarding_completed: boolean | null;
  notifications_push: boolean | null; notifications_email: boolean | null;
  created_at: string | null; tracker_started_at: string | null;
};

const BASE_CYCLE_DAYS = 30;

type Dependent = {
  id: string; name: string; product_sku: string | null;
  quantity: number | null; last_replaced_at: string | null;
  notes: string | null; created_at: string | null;
};

function getDepStatus(lastReplaced: string | null) {
  if (!lastReplaced) return { daysLeft: 0, progress: 100, color: '#DC2626', label: 'Replace Now' };
  const elapsed = Math.max(0, Date.now() - new Date(lastReplaced).getTime());
  const dLeft = Math.max(0, BASE_CYCLE_DAYS - Math.floor(elapsed / 86400000));
  const prog = Math.max(0, Math.min(100, ((BASE_CYCLE_DAYS - dLeft) / BASE_CYCLE_DAYS) * 100));
  const color = dLeft > 7 ? '#16A34A' : dLeft > 0 ? '#D97706' : '#DC2626';
  const label = dLeft > 7 ? 'On Track' : dLeft > 0 ? 'Due Soon' : 'Replace Now';
  return { daysLeft: dLeft, progress: prog, color, label };
}

function sortByUrgency(deps: Dependent[]): Dependent[] {
  return [...deps].sort((a, b) => getDepStatus(a.last_replaced_at).daysLeft - getDepStatus(b.last_replaced_at).daysLeft);
}

// ── Conflict Detection & Priority Resolution ──
type ConflictGroup = {
  entries: { id: string; name: string; daysLeft: number }[];
  suggestedBatchDate: string;
};

function detectScheduleConflicts(deps: Dependent[], windowDays: number = 3): ConflictGroup[] {
  if (deps.length < 2) return [];
  const entries = deps.map(d => ({
    id: d.id, name: d.name,
    daysLeft: getDepStatus(d.last_replaced_at).daysLeft,
  })).sort((a, b) => a.daysLeft - b.daysLeft);

  const groups: ConflictGroup[] = [];
  let current: typeof entries = [entries[0]];

  for (let i = 1; i < entries.length; i++) {
    if (entries[i].daysLeft - current[current.length - 1].daysLeft <= windowDays) {
      current.push(entries[i]);
    } else {
      if (current.length > 1) {
        const avg = Math.round(current.reduce((s, e) => s + e.daysLeft, 0) / current.length);
        const d = new Date(); d.setDate(d.getDate() + avg);
        groups.push({ entries: [...current], suggestedBatchDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
      }
      current = [entries[i]];
    }
  }
  if (current.length > 1) {
    const avg = Math.round(current.reduce((s, e) => s + e.daysLeft, 0) / current.length);
    const d = new Date(); d.setDate(d.getDate() + avg);
    groups.push({ entries: [...current], suggestedBatchDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
  }
  return groups;
}

type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
function getPriorityLevel(daysLeft: number): PriorityLevel {
  if (daysLeft <= 0) return 'critical';
  if (daysLeft <= 3) return 'high';
  if (daysLeft <= 7) return 'medium';
  return 'low';
}
const PRIORITY_CFG = {
  critical: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'P0' },
  high:     { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'P1' },
  medium:   { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'P2' },
  low:      { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'P3' },
};

function computeTimeLeft(createdAt: string | null, quantity: number = 1) {
  const qty = Math.max(1, quantity);
  const totalSupplyDays = BASE_CYCLE_DAYS * qty;

  if (!createdAt) {
    return { 
      swapValue: BASE_CYCLE_DAYS, swapLabel: 'days left', isHours: false, swapRawDays: BASE_CYCLE_DAYS,
      reorderRawDays: totalSupplyDays 
    };
  }
  
  const elapsedMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  
  // Total cycle for REORDER
  const totalCycleMs = totalSupplyDays * 86400000;
  const msLeftReorder = totalCycleMs - (elapsedMs % totalCycleMs);
  const reorderRawDays = Math.ceil(msLeftReorder / 86400000);

  // Cycle for SWAP (Next 30-day interval)
  const swapCycleMs = BASE_CYCLE_DAYS * 86400000;
  const msLeftSwap = swapCycleMs - (elapsedMs % swapCycleMs);
  const hoursLeftSwap = Math.ceil(msLeftSwap / 3600000);
  
  if (hoursLeftSwap <= 48) {
    return { 
      swapValue: hoursLeftSwap, 
      swapLabel: hoursLeftSwap === 1 ? 'hour left' : 'hours left', 
      isHours: true, 
      swapRawDays: Math.ceil(hoursLeftSwap / 24),
      reorderRawDays
    };
  }
  
  const daysLeftSwap = Math.ceil(hoursLeftSwap / 24);
  return { 
    swapValue: daysLeftSwap, 
    swapLabel: 'days left', 
    isHours: false, 
    swapRawDays: daysLeftSwap,
    reorderRawDays
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'self' | 'caregiver'>('self');

  // ── Caregiver state ──
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingPerson, setAddingPerson] = useState(false);
  const [replacedId, setReplacedId] = useState<string | null>(null); // for green flash
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [cgError, setCgError] = useState<string | null>(null);
  // Swipe state per card
  const swipeXRefs = useRef<Record<string, Animated.Value>>({});
  const touchStartRef = useRef<{ x: number; id: string } | null>(null);

  const headerOp = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOp = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(30)).current;
  const cardsOp = useRef(new Animated.Value(0)).current;

  const timeLeft = computeTimeLeft(profile?.tracker_started_at ?? profile?.created_at ?? null, profile?.quantity ?? 1);
  const status = getStatusConfig(timeLeft.swapRawDays);
  const progress = Math.max(0, Math.min(1, timeLeft.swapRawDays / BASE_CYCLE_DAYS));
  const nextDate = (() => { const d = new Date(); d.setDate(d.getDate() + timeLeft.swapRawDays); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })();
  const runOutDate = (() => { const d = new Date(); d.setDate(d.getDate() + timeLeft.reorderRawDays); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })();

  const ringSize = 200, sw = 14, r = (ringSize - sw) / 2;
  const circ = 2 * Math.PI * r, dashOff = circ * (1 - progress);

  // Caregiver computed values
  const sortedDeps = sortByUrgency(dependents);
  const needsAttention = dependents.filter(d => getDepStatus(d.last_replaced_at).daysLeft <= 7).length;
  const urgentDeps = dependents.filter(d => getDepStatus(d.last_replaced_at).daysLeft <= 3);
  const lowSupplyCount = dependents.filter(d => getDepStatus(d.last_replaced_at).daysLeft <= 14).length;
  const conflicts = detectScheduleConflicts(dependents);

  const reorderTier = getDiscountTier(timeLeft.reorderRawDays);

  const handleReorder = async () => {
    const cartUrl = buildCartUrl(profile?.quantity ?? 1, timeLeft.reorderRawDays, 'mobile');
    try { await Browser.open({ url: cartUrl }); } catch (e) { console.error(e); }
  };

  const handleBulkReorder = async () => {
    if (dependents.length === 0) return;
    const lowestDays = Math.min(...dependents.map(d => getDepStatus(d.last_replaced_at).daysLeft));
    const cartUrl = buildCartUrl(lowSupplyCount, lowestDays, 'mobile');
    try { await Browser.open({ url: cartUrl }); } catch (e) { console.error(e); }
  };

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setFetchError(null);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      setProfile(data as Profile | null);
    } catch (e: any) {
      setFetchError(e?.message || 'Failed to load profile');
    }
  }, [user]);

  const fetchDependents = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('dependents').select('*').eq('caregiver_id', user.id).order('created_at', { ascending: true });
      if (error) throw error;
      setDependents((data as Dependent[]) || []);
    } catch (e: any) {
      console.error('Failed to load dependents', e);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await fetchProfile();
      await fetchDependents();
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
  }, [user, fetchProfile, fetchDependents]);

  // Real-time subscription for dependents
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('dependents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dependents', filter: `caregiver_id=eq.${user.id}` },
        () => { fetchDependents(); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchDependents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchDependents()]);
    setRefreshing(false);
  }, [fetchProfile, fetchDependents]);

  // ── Caregiver CRUD ──
  const handleMarkReplaced = useCallback(async (depId: string) => {
    const now = new Date().toISOString();
    // Optimistic update
    setDependents(prev => prev.map(d => d.id === depId ? { ...d, last_replaced_at: now } : d));
    setReplacedId(depId);
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
    setTimeout(() => setReplacedId(null), 1500);

    const { error } = await supabase.from('dependents').update({ last_replaced_at: now }).eq('id', depId);
    if (error) {
      // Rollback
      setCgError('Failed to update — please try again');
      setTimeout(() => setCgError(null), 3000);
      await fetchDependents();
    }
  }, [fetchDependents]);

  const handleDeleteDependent = useCallback((dep: Dependent) => {
    Alert.alert('Remove Person', `Remove ${dep.name} from your care list? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        setDependents(prev => prev.filter(d => d.id !== dep.id));
        const { error } = await supabase.from('dependents').delete().eq('id', dep.id);
        if (error) {
          setCgError('Failed to remove — please try again');
          setTimeout(() => setCgError(null), 3000);
          await fetchDependents();
        }
      }},
    ]);
  }, [fetchDependents]);

  const handleAddPerson = useCallback(async () => {
    if (!user || !newName.trim()) return;
    setAddingPerson(true); setCgError(null);
    const { error } = await supabase.from('dependents').insert({
      caregiver_id: user.id, name: newName.trim(), product_sku: 'OXI-TUB-07',
      quantity: newQty, last_replaced_at: new Date().toISOString(),
    });
    setAddingPerson(false);
    if (error) {
      setCgError('Failed to add person — please try again');
      setTimeout(() => setCgError(null), 3000);
    } else {
      setNewName(''); setNewQty(1); setShowAddForm(false);
      await fetchDependents();
      try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
    }
  }, [user, newName, newQty, fetchDependents]);

  const handleShareSummary = useCallback(async () => {
    const lines = sortedDeps.map(d => {
      const ds = getDepStatus(d.last_replaced_at);
      const next = new Date(); next.setDate(next.getDate() + ds.daysLeft);
      return `• ${d.name} — ${ds.label} (${ds.daysLeft} days left, next due ${next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    });
    const msg = `OxiSure Caregiver Summary\n${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n${lines.join('\n')}\n\nManaging ${dependents.length} ${dependents.length === 1 ? 'person' : 'people'}`;
    try { await Share.share({ message: msg }); } catch {}
  }, [sortedDeps, dependents.length]);

  // Swipe helpers
  const getSwipeX = (id: string) => {
    if (!swipeXRefs.current[id]) swipeXRefs.current[id] = new Animated.Value(0);
    return swipeXRefs.current[id];
  };
  const onSwipeStart = (id: string, pageX: number) => { touchStartRef.current = { x: pageX, id }; };
  const onSwipeMove = (id: string, pageX: number) => {
    if (!touchStartRef.current || touchStartRef.current.id !== id) return;
    const dx = Math.min(0, Math.max(-80, pageX - touchStartRef.current.x));
    getSwipeX(id).setValue(dx);
  };
  const onSwipeEnd = (id: string) => {
    if (!touchStartRef.current || touchStartRef.current.id !== id) return;
    const val = (getSwipeX(id) as any).__getValue?.() ?? 0;
    if (val < -40) {
      Animated.spring(getSwipeX(id), { toValue: -80, tension: 50, friction: 10, useNativeDriver: true }).start();
    } else {
      Animated.spring(getSwipeX(id), { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }).start();
    }
    touchStartRef.current = null;
  };
  const resetSwipe = (id: string) => {
    Animated.spring(getSwipeX(id), { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }).start();
  };

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
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" colors={['#0EA5E9']} />}
        >
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

          {/* Error State */}
          {fetchError && (
            <View style={s.errorCard}>
              <Text style={{ fontSize: 40, marginBottom: Spacing.md }}>⚠️</Text>
              <Text style={s.errorTitle}>Something went wrong</Text>
              <Text style={s.errorDesc}>{fetchError}</Text>
              <TouchableOpacity style={s.retryBtn} onPress={onRefresh} activeOpacity={0.7}>
                <Text style={s.retryText}>Try Again</Text>
              </TouchableOpacity>
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
                  <Text style={[s.ringDays, { color: status.color }]}>{timeLeft.swapValue}</Text>
                  <Text style={s.ringLabel}>{timeLeft.swapLabel}</Text>
                </View>
              </View>
              <View style={[s.statusBadge, { backgroundColor: status.color + '14', borderColor: status.color + '30' }]}>
                <Text style={{ fontSize: 16 }}>{status.emoji}</Text>
                <Text style={[s.statusLabel, { color: status.color }]}>{status.label}</Text>
                <Text style={[s.statusSub, { color: status.color }]}>Next swap on {nextDate}</Text>
              </View>
            </Animated.View>

            {/* Cards */}
            <Animated.View style={{ opacity: cardsOp, transform: [{ translateY: cardsY }] }}>
              {/* Reorder CTA */}
              {timeLeft.reorderRawDays <= 30 && (
                <TouchableOpacity style={s.reorderCard} activeOpacity={0.85} onPress={handleReorder}>
                  <LinearGradient colors={['#0EA5E9', '#0284C7', '#0369A1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.reorderGrad}>
                    <View style={s.reorderContent}>
                      <View style={s.reorderBadge}><Text style={s.reorderBadgeText}>🎉 SAVE {reorderTier.percent}%</Text></View>
                      <Text style={s.reorderTitle}>Ready to Reorder?</Text>
                      <Text style={s.reorderSub}>{reorderTier.message}</Text>
                      <View style={s.reorderButton}><Text style={s.reorderButtonText}>Order Now →</Text></View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

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
                    ['Quantity', `${profile?.quantity || 1} Tube(s)`],
                    ['Next Swap', nextDate],
                    [(profile?.quantity && profile.quantity > 1) ? 'Supply Run Out' : 'Order Next By', runOutDate],
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
              {/* Caregiver Greeting */}
              <View style={s.cgGreeting}>
                <Text style={s.cgGreetTitle}>❤️ Managing {dependents.length} {dependents.length === 1 ? 'person' : 'people'}</Text>
                {dependents.length > 0 && (
                  <TouchableOpacity onPress={handleShareSummary} activeOpacity={0.7} style={s.shareBtn}>
                    <Text style={s.shareBtnText}>📋 Share Summary</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Error Toast */}
              {cgError && <View style={s.cgErrorBanner}><Text style={s.cgErrorText}>⚠️ {cgError}</Text></View>}

              {/* Urgent Alert Banner */}
              {urgentDeps.length > 0 && (
                <View style={s.urgentBanner}>
                  <Text style={{ fontSize: 20 }}>🚨</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.urgentTitle}>Immediate attention needed</Text>
                    <Text style={s.urgentNames}>{urgentDeps.map(d => d.name).join(', ')} — tubing overdue or due within 3 days</Text>
                  </View>
                </View>
              )}

              {/* Conflict Detection */}
              {conflicts.length > 0 && (
                <View style={s.conflictCard}>
                  <View style={s.conflictHeader}>
                    <Text style={{ fontSize: 18 }}>⚡</Text>
                    <Text style={s.conflictTitle}>Scheduling Overlaps</Text>
                  </View>
                  {conflicts.map((group, idx) => (
                    <View key={idx} style={s.conflictGroup}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.conflictNames}>{group.entries.map(e => e.name).join(' & ')}</Text>
                        <Text style={s.conflictDue}>Due within {Math.abs(group.entries[group.entries.length - 1].daysLeft - group.entries[0].daysLeft)} days of each other</Text>
                      </View>
                      <View style={s.conflictBatch}>
                        <Text style={s.conflictBatchLabel}>Batch on</Text>
                        <Text style={s.conflictBatchDate}>{group.suggestedBatchDate}</Text>
                      </View>
                    </View>
                  ))}
                  <Text style={s.conflictHint}>💡 Replace these together to simplify your schedule</Text>
                </View>
              )}

              {/* Stats Row */}
              <View style={s.cgStats}>
                <View style={s.cgStatCard}>
                  <Text style={{ fontSize: 18 }}>👥</Text>
                  <Text style={s.cgStatValue}>{dependents.length}</Text>
                  <Text style={s.cgStatLabel}>People</Text>
                </View>
                <View style={s.cgStatCard}>
                  <Text style={{ fontSize: 18 }}>✅</Text>
                  <Text style={[s.cgStatValue, { color: '#16A34A' }]}>{dependents.length - needsAttention}</Text>
                  <Text style={s.cgStatLabel}>On Track</Text>
                </View>
                <View style={[s.cgStatCard, needsAttention > 0 && { borderColor: '#FDE68A' }]}>
                  <Text style={{ fontSize: 18 }}>⚠️</Text>
                  <Text style={[s.cgStatValue, needsAttention > 0 && { color: '#D97706' }]}>{needsAttention}</Text>
                  <Text style={s.cgStatLabel}>Attention</Text>
                </View>
              </View>

              {lowSupplyCount > 0 && (
                <TouchableOpacity style={s.bulkReorderCard} activeOpacity={0.85} onPress={handleBulkReorder}>
                  <LinearGradient colors={['#0EA5E9', '#0284C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.bulkReorderGrad}>
                    <Text style={{ fontSize: 18 }}>📦</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.bulkReorderTitle}>{lowSupplyCount} {lowSupplyCount === 1 ? 'person needs' : 'people need'} supplies soon</Text>
                      <Text style={s.bulkReorderSub}>Order replacement tubing for everyone →</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Dependent Cards */}
              {sortedDeps.length > 0 ? sortedDeps.map(dep => {
                const ds = getDepStatus(dep.last_replaced_at);
                const nextSwap = new Date(); nextSwap.setDate(nextSwap.getDate() + ds.daysLeft);
                const isReplaced = replacedId === dep.id;
                const miniR = 20, miniSw = 3.5, miniCirc = 2 * Math.PI * miniR;
                const miniOff = miniCirc * (ds.progress / 100);

                return (
                  <View key={dep.id} style={s.swipeContainer}>
                    {/* Delete behind layer */}
                    <View style={s.swipeDeleteBg}>
                      <TouchableOpacity style={s.swipeDeleteBtn} onPress={() => { resetSwipe(dep.id); handleDeleteDependent(dep); }} activeOpacity={0.7}>
                        <Text style={s.swipeDeleteText}>🗑️ Remove</Text>
                      </TouchableOpacity>
                    </View>
                    {/* Card front */}
                    <Animated.View
                      style={[s.dependentCard, isReplaced && s.depCardFlash, { transform: [{ translateX: getSwipeX(dep.id) }] }]}
                      onTouchStart={(e: any) => onSwipeStart(dep.id, e.nativeEvent.pageX)}
                      onTouchMove={(e: any) => onSwipeMove(dep.id, e.nativeEvent.pageX)}
                      onTouchEnd={() => onSwipeEnd(dep.id)}
                    >
                      {/* Mini ring */}
                      <View style={s.depRingContainer}>
                        <Svg width={48} height={48} style={s.depRingSvg}>
                          <Circle cx={24} cy={24} r={miniR} stroke="#E2E8F0" strokeWidth={miniSw} fill="transparent" />
                          <Circle cx={24} cy={24} r={miniR} stroke={ds.color} strokeWidth={miniSw} fill="transparent"
                            strokeDasharray={`${miniCirc}`} strokeDashoffset={miniOff} strokeLinecap="round" rotation="-90" origin="24, 24" />
                        </Svg>
                        <View style={s.depAvatarInner}>
                          <Text style={[s.depDaysText, { color: ds.color }]}>{ds.daysLeft}</Text>
                        </View>
                      </View>
                      {/* Info */}
                      <View style={s.depInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <Text style={s.depName} numberOfLines={1}>{dep.name}</Text>
                          <View style={[s.depRoleBadge, { backgroundColor: ds.color + '18', borderColor: ds.color + '30' }]}>
                            <Text style={[s.depRoleText, { color: ds.color }]}>{ds.label}</Text>
                          </View>
                          <View style={[s.priorityBadge, { backgroundColor: PRIORITY_CFG[getPriorityLevel(ds.daysLeft)].bg, borderColor: PRIORITY_CFG[getPriorityLevel(ds.daysLeft)].border }]}>
                            <Text style={[s.priorityBadgeText, { color: PRIORITY_CFG[getPriorityLevel(ds.daysLeft)].color }]}>{PRIORITY_CFG[getPriorityLevel(ds.daysLeft)].label}</Text>
                          </View>
                          {dep.notes && dep.notes.trim() !== '' && <Text style={{ fontSize: 12 }}>📝</Text>}
                        </View>
                        <Text style={s.depProduct} numberOfLines={1}>
                          {dep.product_sku || 'Standard Tubing'} · Qty: {dep.quantity || 1} · Next: {nextSwap.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        {dep.last_replaced_at && (
                          <Text style={{ fontSize: 11, fontFamily: 'Inter', color: '#CBD5E1', marginTop: 1 }}>
                            Last replaced {new Date(dep.last_replaced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                        )}
                      </View>
                      {/* Replace button */}
                      <TouchableOpacity
                        style={[s.depReplaceBtn, isReplaced && s.depReplaceBtnDone]}
                        onPress={() => handleMarkReplaced(dep.id)} activeOpacity={0.7}
                      >
                        <Text style={[s.depReplaceBtnText, isReplaced && { color: '#FFF' }]}>
                          {isReplaced ? '✓' : '🔄'}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                );
              }) : (
                /* Empty State */
                <View style={s.cgEmptyCard}>
                  <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>👥</Text>
                  <Text style={s.cgEmptyTitle}>No people added yet</Text>
                  <Text style={s.cgEmptyDesc}>Add family members or patients to start tracking their tubing replacement schedules.</Text>
                </View>
              )}

              {/* Add Person */}
              {showAddForm ? (
                <View style={s.addFormCard}>
                  <Text style={s.addFormTitle}>Add a Person</Text>
                  <View style={{ gap: Spacing.md }}>
                    <View>
                      <Text style={s.addFormLabel}>Name *</Text>
                      <TextInput style={s.addFormInput} placeholder="e.g. Mom, John" placeholderTextColor="#CBD5E1" value={newName} onChangeText={setNewName} />
                    </View>
                    <View>
                      <Text style={s.addFormLabel}>Tubes per cycle</Text>
                      <View style={s.addFormStepperRow}>
                        <TouchableOpacity style={s.addFormStepperBtn} onPress={() => setNewQty(Math.max(1, newQty - 1))}><Text style={s.addFormStepperIcon}>−</Text></TouchableOpacity>
                        <Text style={s.addFormQtyText}>{newQty}</Text>
                        <TouchableOpacity style={[s.addFormStepperBtn, { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' }]} onPress={() => setNewQty(Math.min(12, newQty + 1))}><Text style={[s.addFormStepperIcon, { color: '#FFF' }]}>+</Text></TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <View style={s.addFormActions}>
                    <TouchableOpacity style={s.addFormCancelBtn} onPress={() => { setShowAddForm(false); setNewName(''); setNewQty(1); }} activeOpacity={0.7}>
                      <Text style={s.addFormCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.addFormSubmitBtn, { opacity: addingPerson || !newName.trim() ? 0.5 : 1 }]} onPress={handleAddPerson} disabled={addingPerson || !newName.trim()} activeOpacity={0.85}>
                      <LinearGradient colors={['#38BDF8', '#0EA5E9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.addFormSubmitGrad}>
                        {addingPerson ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.addFormSubmitText}>➕ Add Person</Text>}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={s.addPersonCard} onPress={() => setShowAddForm(true)} activeOpacity={0.7}>
                  <View style={s.addPersonIcon}><Text style={{ fontSize: 20 }}>➕</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.addPersonTitle}>Add a Person</Text>
                    <Text style={s.addPersonSub}>Track tubing for someone you care for</Text>
                  </View>
                </TouchableOpacity>
              )}
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

  caregiverView: { gap: Spacing.sm, marginTop: Spacing.sm },
  cgStats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  cgStatCard: { flex: 1, backgroundColor: '#FFF', borderRadius: Radii.lg, padding: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0', ...Shadows.sm },
  cgStatValue: { fontSize: 24, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E', marginBottom: 2 },
  cgStatLabel: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },

  dependentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: Radii.xl, padding: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0', ...Shadows.md },
  depRingContainer: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  depRingSvg: { position: 'absolute' },
  depAvatarInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  depInfo: { flex: 1, justifyContent: 'center' },
  depName: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E' },
  depRoleBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  depRoleText: { fontSize: 10, fontWeight: '600', fontFamily: 'Inter', color: '#475569', textTransform: 'uppercase' },
  depProduct: { fontSize: 13, fontFamily: 'Inter', color: '#64748B', marginTop: 2 },
  depDaysText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  depChevron: { paddingLeft: Spacing.sm },

  addPersonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: Radii.xl, padding: Spacing.lg, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', marginTop: Spacing.sm },
  addPersonIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, ...Shadows.sm },
  addPersonTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter', color: '#0F172A' },
  addPersonSub: { fontSize: 13, fontFamily: 'Inter', color: '#64748B', marginTop: 2 },

  errorCard: { alignItems: 'center', paddingVertical: Spacing.xxl, backgroundColor: '#FFF', borderRadius: Radii.lg, borderWidth: 1, borderColor: '#FECACA', marginBottom: Spacing.lg },
  errorTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#DC2626', marginBottom: Spacing.xs },
  errorDesc: { fontSize: 14, fontFamily: 'Inter', color: '#64748B', textAlign: 'center', paddingHorizontal: Spacing.xl, lineHeight: 20, marginBottom: Spacing.md },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radii.sm, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  retryText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#DC2626' },

  cgGreeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cgGreetTitle: { fontSize: 17, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E' },
  shareBtn: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radii.full, backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD' },
  shareBtnText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter', color: '#0C5A8A' },

  cgErrorBanner: { backgroundColor: '#FEF2F2', borderRadius: Radii.lg, padding: Spacing.md, borderWidth: 1, borderColor: '#FECACA', marginBottom: Spacing.sm },
  cgErrorText: { fontSize: 13, fontWeight: '500', fontFamily: 'Inter', color: '#DC2626' },

  urgentBanner: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: '#FEF2F2', borderRadius: Radii.lg, padding: Spacing.md, borderWidth: 1, borderColor: '#FECACA', marginBottom: Spacing.sm },
  urgentTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter', color: '#DC2626', marginBottom: 2 },
  urgentNames: { fontSize: 13, fontFamily: 'Inter', color: '#B91C1C', lineHeight: 18 },

  bulkReorderCard: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.sm, ...Shadows.md },
  bulkReorderGrad: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radii.lg },
  bulkReorderTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter', color: '#FFF' },
  bulkReorderSub: { fontSize: 12, fontFamily: 'Inter', color: 'rgba(255,255,255,0.85)', marginTop: 1 },

  swipeContainer: { position: 'relative', overflow: 'hidden', borderRadius: Radii.xl, marginBottom: 0 },
  swipeDeleteBg: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, backgroundColor: '#DC2626', borderTopRightRadius: Radii.xl, borderBottomRightRadius: Radii.xl, justifyContent: 'center', alignItems: 'center' },
  swipeDeleteBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  swipeDeleteText: { fontSize: 11, fontWeight: '700', fontFamily: 'Inter', color: '#FFF' },

  depCardFlash: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  depReplaceBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD', justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.sm },
  depReplaceBtnDone: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  depReplaceBtnText: { fontSize: 16 },

  cgEmptyCard: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg, backgroundColor: '#FFF', borderRadius: Radii.xl, borderWidth: 1, borderColor: '#E2E8F0', ...Shadows.sm },
  cgEmptyTitle: { fontSize: 18, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E', marginBottom: Spacing.xs },
  cgEmptyDesc: { fontSize: 14, fontFamily: 'Inter', color: '#94A3B8', textAlign: 'center', lineHeight: 20, maxWidth: 280 },

  addFormCard: { backgroundColor: '#FFF', borderRadius: Radii.xl, borderWidth: 1, borderColor: '#E2E8F0', padding: Spacing.lg, marginTop: Spacing.sm, ...Shadows.md },
  addFormTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E', marginBottom: Spacing.lg },
  addFormLabel: { fontSize: 12, fontWeight: '700', fontFamily: 'Inter', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  addFormInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter', color: '#1A1A2E' },
  addFormStepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  addFormStepperBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  addFormStepperIcon: { fontSize: 20, fontWeight: '600', color: '#1A1A2E' },
  addFormQtyText: { fontSize: 28, fontWeight: '800', fontFamily: 'Inter', color: '#0C5A8A', minWidth: 40, textAlign: 'center' },
  addFormActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  addFormCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: Radii.md, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', alignItems: 'center' },
  addFormCancelText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#64748B' },
  addFormSubmitBtn: { flex: 2, borderRadius: Radii.md, overflow: 'hidden' },
  addFormSubmitGrad: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.md },
  addFormSubmitText: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter', color: '#FFF' },

  // Conflict Detection styles
  conflictCard: { backgroundColor: '#FEFCE8', borderRadius: Radii.lg, padding: Spacing.md, borderWidth: 1, borderColor: '#FDE68A', marginBottom: Spacing.sm },
  conflictHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  conflictTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter', color: '#92400E' },
  conflictGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: Radii.md, padding: Spacing.sm + 2, marginBottom: Spacing.xs, borderWidth: 1, borderColor: '#FDE68A' },
  conflictNames: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter', color: '#78350F' },
  conflictDue: { fontSize: 11, fontFamily: 'Inter', color: '#A16207', marginTop: 1 },
  conflictBatch: { alignItems: 'center', marginLeft: Spacing.sm, backgroundColor: '#FEF3C7', borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  conflictBatchLabel: { fontSize: 9, fontWeight: '600', fontFamily: 'Inter', color: '#A16207', textTransform: 'uppercase', letterSpacing: 0.5 },
  conflictBatchDate: { fontSize: 12, fontWeight: '700', fontFamily: 'Inter', color: '#78350F' },
  conflictHint: { fontSize: 11, fontFamily: 'Inter', color: '#A16207', marginTop: Spacing.xs },

  // Priority badge styles
  priorityBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, borderWidth: 1 },
  priorityBadgeText: { fontSize: 9, fontWeight: '800', fontFamily: 'Inter', letterSpacing: 0.3 },
});
