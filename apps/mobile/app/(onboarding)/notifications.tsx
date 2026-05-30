import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Switch, StyleSheet, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import StepIndicator from '@/components/StepIndicator';
import { setupPushNotifications } from '@/lib/push-notifications';

const STEPS = ['Type', 'Product', 'Quantity', 'Alerts'];

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const { user, setOnboardingCompleted } = useAuth();
  const colors = Colors[useColorScheme() ?? 'light'];
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bothOff = !pushEnabled && !emailEnabled;

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    
    const { error: dbErr } = await supabase
      .from('profiles')
      .update({
        notifications_push: pushEnabled,
        notifications_email: emailEnabled,
        onboarding_completed: true,
        tracker_started_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (dbErr) {
      setError('Failed to save preferences. Please try again.');
      setSaving(false);
      return;
    }

    if (pushEnabled) {
      await setupPushNotifications(user.id);
    }

    setOnboardingCompleted(true);
    setSaving(false);
    navigate('/(app)/dashboard', { replace: true });
  };

  return (
    <View style={s.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      <View style={s.content}>
        <View style={s.navRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigate('/(onboarding)/quantity')} activeOpacity={0.7}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
        </View>
        <StepIndicator steps={STEPS} currentStep={3} />
        <View style={s.heading}>
          <Text style={s.title}>Stay on Schedule</Text>
          <Text style={s.sub}>Choose how you'd like to be reminded when it's time to replace your tubing.</Text>
        </View>

        {error && <View style={s.alertErr}><Text style={s.alertErrText}>⚠️ {error}</Text></View>}

        <View style={s.cards}>
          <View style={[s.toggleCard, pushEnabled && s.toggleCardActive]}>
            <View style={[s.toggleIcon, { backgroundColor: pushEnabled ? '#0EA5E9' + '18' : '#F1F5F9' }]}>
              <Text style={{ fontSize: 22 }}>🔔</Text>
            </View>
            <View style={s.toggleText}>
              <Text style={s.toggleTitle}>Push Notifications</Text>
              <Text style={s.toggleDesc}>Get alerted directly on your phone</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#E2E8F0', true: '#0EA5E9' }} thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined} ios_backgroundColor="#E2E8F0" />
          </View>
          <View style={[s.toggleCard, emailEnabled && s.toggleCardActive]}>
            <View style={[s.toggleIcon, { backgroundColor: emailEnabled ? '#38BDF8' + '18' : '#F1F5F9' }]}>
              <Text style={{ fontSize: 22 }}>📧</Text>
            </View>
            <View style={s.toggleText}>
              <Text style={s.toggleTitle}>Email Reminders</Text>
              <Text style={s.toggleDesc}>Receive reminders in your inbox</Text>
            </View>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#E2E8F0', true: '#0EA5E9' }} thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined} ios_backgroundColor="#E2E8F0" />
          </View>
        </View>

        {bothOff && (
          <View style={s.warnBox}>
            <Text style={s.warnText}>⚠️ Without reminders, you'll need to check back manually. We recommend enabling at least one.</Text>
          </View>
        )}

        <View style={s.cta}>
          <TouchableOpacity style={[s.btn, { opacity: saving ? 0.7 : 1 }]} onPress={handleComplete} disabled={saving} activeOpacity={0.85}>
            <LinearGradient colors={['#38BDF8', '#0EA5E9', '#0284C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnGrad}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnText}>Complete Setup ✓</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 }, content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl },
  navRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', ...Shadows.sm },
  backArrow: { fontSize: 18, color: '#475569', fontWeight: '600' },
  heading: { marginBottom: Spacing.lg },
  title: { fontSize: 26, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E', letterSpacing: -0.3 },
  sub: { fontSize: 15, fontFamily: 'Inter', color: '#64748B', marginTop: Spacing.xs, lineHeight: 22 },
  alertErr: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md },
  alertErrText: { fontSize: 13, fontWeight: '500', fontFamily: 'Inter', color: '#DC2626' },
  cards: { gap: Spacing.md },
  toggleCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FFF', borderRadius: Radii.lg, padding: Spacing.md + 2, gap: Spacing.md, ...Shadows.sm },
  toggleCardActive: { borderColor: '#7DD3FC', backgroundColor: '#FAFEFF', ...Shadows.md },
  toggleIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  toggleText: { flex: 1 },
  toggleTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#1A1A2E', marginBottom: 2 },
  toggleDesc: { fontSize: 13, fontFamily: 'Inter', color: '#64748B' },
  warnBox: { borderRadius: Radii.lg, padding: Spacing.md + 2, marginTop: Spacing.md, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  warnText: { fontSize: 14, fontFamily: 'Inter', color: '#D97706', lineHeight: 20 },
  cta: { marginTop: 'auto', paddingBottom: Spacing.xl },
  btn: { borderRadius: Radii.md, overflow: 'hidden', ...Shadows.glow('#0EA5E9') },
  btnGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 56, borderRadius: Radii.md },
  btnText: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#FFF', letterSpacing: 0.3 },
});
