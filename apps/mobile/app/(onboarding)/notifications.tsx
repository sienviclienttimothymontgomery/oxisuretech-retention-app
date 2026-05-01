import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Switch, StyleSheet, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigate } from 'react-router-dom';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS = ['Type', 'Product', 'Quantity', 'Alerts'];

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const bothOff = !pushEnabled && !emailEnabled;

  const handleComplete = () => {
    navigate('/(app)/dashboard', { replace: true });
  };

  return (
    <View style={s.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      <View style={s.content}>
        {/* Steps */}
        <View style={s.stepRow}>
          {STEPS.map((step, i) => (
            <View key={step} style={s.stepItem}>
              <View style={[s.stepDot, { backgroundColor: '#0EA5E9' }]}>
                {i < 3
                  ? <Text style={{ fontSize: 13, color: '#FFF', fontWeight: '600' }}>✓</Text>
                  : <Text style={[Typography.caption, { color: '#FFF' }]}>{i + 1}</Text>}
              </View>
              <Text style={[Typography.caption, {
                color: '#0C5A8A', marginTop: 4, fontWeight: i === 3 ? '600' : '400',
              }]}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={s.heading}>
          <Text style={s.title}>Stay on Schedule</Text>
          <Text style={s.sub}>Choose how you'd like to be reminded when it's time to replace your tubing.</Text>
        </View>

        {/* Toggle Cards */}
        <View style={s.cards}>
          <View style={s.toggleCard}>
            <View style={[s.toggleIcon, { backgroundColor: 'rgba(14,165,233,0.12)' }]}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
            </View>
            <View style={s.toggleText}>
              <Text style={s.toggleTitle}>Push Notifications</Text>
              <Text style={s.toggleDesc}>Get alerted directly on your phone</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E2E8F0', true: '#0EA5E9' }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={s.toggleCard}>
            <View style={[s.toggleIcon, { backgroundColor: 'rgba(56,189,248,0.12)' }]}>
              <Text style={{ fontSize: 20 }}>📧</Text>
            </View>
            <View style={s.toggleText}>
              <Text style={s.toggleTitle}>Email Reminders</Text>
              <Text style={s.toggleDesc}>Receive reminders in your inbox</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#E2E8F0', true: '#0EA5E9' }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
              ios_backgroundColor="#E2E8F0"
            />
          </View>
        </View>

        {bothOff && (
          <View style={s.warnBox}>
            <Text style={s.warnText}>
              Without reminders, you'll need to check back manually. We recommend enabling at least one.
            </Text>
          </View>
        )}

        <View style={s.cta}>
          <TouchableOpacity style={s.btn} onPress={handleComplete} activeOpacity={0.85}>
            <LinearGradient colors={['#38BDF8', '#0EA5E9', '#0284C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnGrad}>
              <Text style={s.btnText}>Complete Setup →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, marginBottom: Spacing.xl, paddingTop: Spacing.lg },
  stepItem: { alignItems: 'center' },
  stepDot: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  heading: { marginBottom: Spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E', letterSpacing: -0.3 },
  sub: { fontSize: 15, color: '#64748B', marginTop: Spacing.xs, lineHeight: 22 },
  cards: { gap: Spacing.md },
  toggleCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', borderRadius: Radii.md, padding: Spacing.md, gap: Spacing.md },
  toggleIcon: { width: 42, height: 42, borderRadius: Radii.sm, justifyContent: 'center', alignItems: 'center' },
  toggleText: { flex: 1 },
  toggleTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A2E', marginBottom: 2 },
  toggleDesc: { fontSize: 13, color: '#64748B' },
  warnBox: { borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.md, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  warnText: { fontSize: 14, color: '#D97706' },
  cta: { marginTop: 'auto', paddingBottom: Spacing.xl },
  btn: { borderRadius: Radii.md, overflow: 'hidden' },
  btnGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
});
