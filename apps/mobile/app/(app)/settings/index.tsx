import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import logoImage from '@/assets/images/logo.png';

type Profile = { quantity: number | null; product_sku: string | null; notifications_push: boolean | null; notifications_email: boolean | null; };

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colors = Colors[useColorScheme() ?? 'light'];
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('quantity, product_sku, notifications_push, notifications_email').eq('id', user.id).single();
      if (data) { setProfile(data as Profile); setQuantity(data.quantity ?? 1); }
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
      ]).start();
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true); setSuccessMsg(null); setErrorMsg(null);
    const { error } = await supabase.from('profiles').update({ quantity }).eq('id', user.id);
    setSaving(false);
    if (error) { setErrorMsg(error.message); } else { setSuccessMsg('Settings updated successfully'); setTimeout(() => setSuccessMsg(null), 3000); }
  };

  if (loading) return (
    <View style={s.loader}><View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      <Image source={logoImage} style={{ width: 200, height: 120, marginBottom: 20 }} resizeMode="contain" />
      <ActivityIndicator size="large" color="#0EA5E9" />
    </View>
  );

  return (
    <View style={s.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigate('/(app)/dashboard')} activeOpacity={0.7}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Image source={logoImage} style={s.headerLogo} resizeMode="contain" />
            <View style={{ width: 40 }} />
          </View>

          {errorMsg && <View style={s.alertErr}><Text style={s.alertErrTitle}>Failed to update settings</Text><Text style={s.alertErrText}>{errorMsg}</Text></View>}
          {successMsg && <View style={s.alertOk}><Text style={{ fontSize: 16 }}>✅</Text><Text style={s.alertOkText}>{successMsg}</Text></View>}

          <Animated.View style={[s.titleSection, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            <Text style={s.title}>Tracker Settings</Text>
            <Text style={s.subtitle}>Update your oxygen usage to recalibrate your replacement alerts.</Text>
          </Animated.View>

          <Animated.View style={[s.productCard, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            <View style={s.productHeader}>
              <View style={s.productIconC}><Text style={{ fontSize: 28 }}>🫁</Text></View>
              <View style={{ flex: 1 }}><Text style={s.productName}>Standard Tubing</Text><Text style={s.productDesc}>30-day lifecycle tracking</Text></View>
            </View>
            <View style={s.qtySection}>
              <Text style={s.qtyLabel}>How many tubes do you use per cycle?</Text>
              <View style={s.stepperRow}>
                <TouchableOpacity style={s.stepperBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))} activeOpacity={0.7}>
                  <Text style={s.stepperIcon}>−</Text>
                </TouchableOpacity>
                <View style={s.qtyDisplay}><Text style={s.qtyText}>{quantity}</Text><Text style={s.qtyUnit}>{quantity === 1 ? 'Tube' : 'Tubes'}</Text></View>
                <TouchableOpacity style={[s.stepperBtn, s.stepperBtnPlus]} onPress={() => setQuantity(Math.min(10, quantity + 1))} activeOpacity={0.7}>
                  <Text style={[s.stepperIcon, { color: '#FFF' }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={[s.saveBtn, { opacity: saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient colors={['#38BDF8', '#0EA5E9', '#0284C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtnGrad}>
                {saving ? <ActivityIndicator color="#FFF" /> : <View style={s.saveBtnContent}><Text style={{ fontSize: 18 }}>💾</Text><Text style={s.saveBtnText}>Save Settings</Text></View>}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[s.configSection, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            <Text style={s.sectionLabel}>Current Configuration</Text>
            <View style={s.configCard}>
              {[
                ['Product SKU', profile?.product_sku || 'Standard Tubing', 'badge'],
                ['Push Notifications', profile?.notifications_push !== false ? 'On' : 'Off', 'status', profile?.notifications_push !== false ? '#16A34A' : '#94A3B8'],
                ['Email Reminders', profile?.notifications_email !== false ? 'On' : 'Off', 'status', profile?.notifications_email !== false ? '#16A34A' : '#94A3B8'],
              ].map(([label, value, type, statusColor], i) => (
                <View key={label as string} style={[s.configRow, i > 0 && s.configRowBorder]}>
                  <Text style={s.configLabel}>{label}</Text>
                  {type === 'badge' ? (
                    <View style={s.configBadge}><Text style={s.configBadgeText}>{value}</Text></View>
                  ) : (
                    <View style={[s.statusDot, { backgroundColor: statusColor as string }]}><Text style={s.statusDotText}>{value}</Text></View>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 }, loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }, safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, paddingVertical: Spacing.sm },
  backBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', ...Shadows.sm },
  backArrow: { fontSize: 20, color: '#475569', fontWeight: '600' },
  headerLogo: { width: 160, height: 48 },

  alertErr: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md },
  alertErrTitle: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#DC2626', marginBottom: 4 },
  alertErrText: { fontSize: 13, fontFamily: 'Inter', color: '#DC2626' },
  alertOk: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  alertOkText: { fontSize: 14, fontWeight: '500', fontFamily: 'Inter', color: '#16A34A' },

  titleSection: { marginBottom: Spacing.lg },
  title: { fontSize: 26, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E', letterSpacing: -0.3, marginBottom: Spacing.xs },
  subtitle: { fontSize: 15, fontFamily: 'Inter', color: '#64748B', lineHeight: 22 },

  productCard: { backgroundColor: '#FFF', borderRadius: Radii.xl, borderWidth: 1, borderColor: '#E2E8F0', padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.lg },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingBottom: Spacing.lg, marginBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  productIconC: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0EA5E9' + '10', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#0EA5E9' + '20' },
  productName: { fontSize: 18, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E' },
  productDesc: { fontSize: 14, fontFamily: 'Inter', color: '#94A3B8', marginTop: 2 },

  qtySection: { marginBottom: Spacing.lg },
  qtyLabel: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter', color: '#1A1A2E', marginBottom: Spacing.md },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },
  stepperBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', ...Shadows.sm },
  stepperBtnPlus: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9', ...Shadows.glow('#0EA5E9') },
  stepperIcon: { fontSize: 22, fontWeight: '600', color: '#1A1A2E' },
  qtyDisplay: { alignItems: 'center', minWidth: 80 },
  qtyText: { fontSize: 44, fontWeight: '800', fontFamily: 'Inter', color: '#0C5A8A', fontVariant: ['tabular-nums'] },
  qtyUnit: { fontSize: 14, fontFamily: 'Inter', color: '#94A3B8', fontWeight: '500', marginTop: -4 },

  saveBtn: { borderRadius: Radii.md, overflow: 'hidden', ...Shadows.glow('#0EA5E9') },
  saveBtnGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 56, borderRadius: Radii.md },
  saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  saveBtnText: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#FFF', letterSpacing: 0.3 },

  configSection: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: 13, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md, paddingLeft: 2 },
  configCard: { backgroundColor: '#FFF', borderRadius: Radii.lg, borderWidth: 1, borderColor: '#E2E8F0', padding: Spacing.md, ...Shadows.sm },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  configRowBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: Spacing.sm, paddingTop: Spacing.md },
  configLabel: { fontSize: 14, fontFamily: 'Inter', color: '#475569', fontWeight: '500' },
  configBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radii.full },
  configBadgeText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter', color: '#1A1A2E' },
  statusDot: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radii.full },
  statusDotText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter', color: '#FFF' },
});
