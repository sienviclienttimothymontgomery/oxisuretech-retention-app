import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import StepIndicator from '@/components/StepIndicator';

const STEPS = ['Type', 'Product', 'Quantity', 'Alerts'];

export default function QuantityScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Button press animations
  const minusBtnScale = useRef(new Animated.Value(1)).current;
  const plusBtnScale = useRef(new Animated.Value(1)).current;
  const qtyScale = useRef(new Animated.Value(1)).current;

  const animatePress = (scaleRef: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scaleRef, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleRef, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const animateQty = () => {
    Animated.sequence([
      Animated.timing(qtyScale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.spring(qtyScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleMinus = () => {
    const newVal = Math.max(1, quantity - 1);
    if (newVal !== quantity) {
      setQuantity(newVal);
      animatePress(minusBtnScale);
      animateQty();
    }
  };

  const handlePlus = () => {
    const newVal = Math.min(10, quantity + 1);
    if (newVal !== quantity) {
      setQuantity(newVal);
      animatePress(plusBtnScale);
      animateQty();
    }
  };

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);
    await supabase.from('profiles').update({ quantity }).eq('id', user.id);
    setLoading(false);
    navigate('/(onboarding)/notifications');
  };

  return (
    <View style={s.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      <View style={s.content}>
        {/* Steps */}
        <StepIndicator steps={STEPS} currentStep={2} />

        <View style={s.heading}>
          <Text style={s.title}>How Many Do You Use?</Text>
          <Text style={s.sub}>This helps us calculate your replacement schedule accurately.</Text>
        </View>

        {/* Stepper */}
        <View style={s.stepperSection}>
          <Text style={s.stepperLabel}>Tubes replaced per cycle</Text>
          <View style={s.stepperRow}>
            <Animated.View style={{ transform: [{ scale: minusBtnScale }] }}>
              <TouchableOpacity style={s.stepperBtn} onPress={handleMinus} activeOpacity={0.7}>
                <Text style={s.stepperIcon}>−</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: qtyScale }] }}>
              <Text style={s.qtyText}>{quantity}</Text>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: plusBtnScale }] }}>
              <TouchableOpacity style={[s.stepperBtn, s.stepperBtnPlus]} onPress={handlePlus} activeOpacity={0.7}>
                <Text style={[s.stepperIcon, { color: '#FFFFFF' }]}>+</Text>
              </TouchableOpacity>
            </Animated.View>
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
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnText}>Continue →</Text>}
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
  heading: { marginBottom: Spacing.xl },
  title: { fontSize: 26, fontWeight: '800', fontFamily: 'Inter', color: '#1A1A2E', letterSpacing: -0.3 },
  sub: { fontSize: 15, fontFamily: 'Inter', color: '#64748B', marginTop: Spacing.xs, lineHeight: 22 },
  stepperSection: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.md },
  stepperLabel: { fontSize: 14, fontFamily: 'Inter', color: '#64748B', fontWeight: '500', marginBottom: Spacing.lg },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl + 8 },
  stepperBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  stepperBtnPlus: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
    ...Shadows.glow('#0EA5E9'),
  },
  stepperIcon: { fontSize: 26, fontWeight: '600', color: '#1A1A2E' },
  qtyText: {
    fontSize: 56,
    fontWeight: '800',
    fontFamily: 'Inter',
    width: 80,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    color: '#0C5A8A',
  },
  hint: { fontSize: 13, fontFamily: 'Inter', color: '#94A3B8', marginTop: Spacing.md },
  infoBox: {
    borderRadius: Radii.lg,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoText: { fontSize: 14, fontFamily: 'Inter', color: '#0C5A8A' },
  cta: { marginTop: 'auto', paddingBottom: Spacing.xl },
  btn: {
    borderRadius: Radii.md,
    overflow: 'hidden',
    ...Shadows.glow('#0EA5E9'),
  },
  btnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: Radii.md,
  },
  btnText: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#FFF', letterSpacing: 0.3 },
});
