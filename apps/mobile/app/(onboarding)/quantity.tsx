import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS = ['Type', 'Product', 'Quantity', 'Done'];

export default function QuantityScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);
    await supabase.from('profiles').update({ quantity }).eq('id', user.id);
    await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
    setLoading(false);
    navigate('/(onboarding)/notifications');
  };

  return (
    <View style={s.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      <View style={s.content}>
        {/* Steps */}
        <View style={s.stepRow}>
          {STEPS.map((step, i) => (
            <View key={step} style={s.stepItem}>
              <View style={[s.stepDot, {
                backgroundColor: i <= 2 ? '#0EA5E9' : '#E2E8F0',
                borderWidth: i > 2 ? 1 : 0, borderColor: '#CBD5E1',
              }]}>
                {i < 2
                  ? <Text style={{ fontSize: 13, color: '#FFF', fontWeight: '600' }}>✓</Text>
                  : <Text style={[Typography.caption, { color: i <= 2 ? '#FFF' : '#94A3B8' }]}>{i + 1}</Text>}
              </View>
              <Text style={[Typography.caption, {
                color: i <= 2 ? '#0C5A8A' : '#94A3B8',
                marginTop: 4, fontWeight: i === 2 ? '600' : '400',
              }]}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={s.heading}>
          <Text style={s.title}>How Many Do You Use?</Text>
          <Text style={s.sub}>This helps us calculate your replacement schedule accurately.</Text>
        </View>

        {/* Stepper */}
        <View style={s.stepperSection}>
          <Text style={s.stepperLabel}>Tubes replaced per cycle</Text>
          <View style={s.stepperRow}>
            <TouchableOpacity style={s.stepperBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))} activeOpacity={0.7}>
              <Text style={s.stepperIcon}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyText}>{quantity}</Text>
            <TouchableOpacity style={s.stepperBtn} onPress={() => setQuantity(Math.min(10, quantity + 1))} activeOpacity={0.7}>
              <Text style={s.stepperIcon}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.hint}>Most users replace {quantity === 1 ? '1 tube' : `${quantity} tubes`} every 30 days</Text>
        </View>

        {quantity > 1 && (
          <View style={s.infoBox}>
            <Text style={s.infoText}>We'll track all <Text style={{ fontWeight: '700' }}>{quantity} tubes</Text> on the same 30-day cycle for easy reordering.</Text>
          </View>
        )}

        <View style={s.cta}>
          <TouchableOpacity style={[s.btn, { opacity: loading ? 0.7 : 1 }]} onPress={handleContinue} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={['#38BDF8', '#0EA5E9', '#0284C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnGrad}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnText}>Continue to Dashboard →</Text>}
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
  heading: { marginBottom: Spacing.xl },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E', letterSpacing: -0.3 },
  sub: { fontSize: 15, color: '#64748B', marginTop: Spacing.xs, lineHeight: 22 },
  stepperSection: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.md },
  stepperLabel: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: Spacing.md },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  stepperBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  stepperIcon: { fontSize: 24, fontWeight: '600', color: '#1A1A2E' },
  qtyText: { fontSize: 52, fontWeight: '800', width: 80, textAlign: 'center', fontVariant: ['tabular-nums'], color: '#1A1A2E' },
  hint: { fontSize: 13, color: '#94A3B8', marginTop: Spacing.md },
  infoBox: { borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.lg, backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD' },
  infoText: { fontSize: 14, color: '#0C5A8A' },
  cta: { marginTop: 'auto', paddingBottom: Spacing.xl },
  btn: { borderRadius: Radii.md, overflow: 'hidden' },
  btnGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
});
