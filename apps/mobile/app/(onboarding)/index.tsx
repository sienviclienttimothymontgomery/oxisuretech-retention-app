import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import StepIndicator from '@/components/StepIndicator';

const STEPS = ['Type', 'Product', 'Quantity', 'Alerts'];

export default function UserTypeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [userType, setUserType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(25)).current;
  const card1Scale = useRef(new Animated.Value(1)).current;
  const card2Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleCardPress = (type: string, scaleRef: Animated.Value) => {
    setUserType(type);
    setError(null);
    Animated.sequence([
      Animated.timing(scaleRef, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleRef, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!userType || !user) return;
    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, user_type: userType, path_type: 'app' });

    if (dbError) {
      console.error('[UserType] DB error:', dbError);
      setError('Failed to save your selection. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/(onboarding)/confirm-product');
  };

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      <View style={styles.content}>
        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={0} />

        {/* Heading */}
        <Animated.View
          style={[
            styles.heading,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <Text style={styles.headingTitle}>Who is this for?</Text>
          <Text style={styles.headingSub}>
            This helps us set up the right experience for you.
          </Text>
        </Animated.View>

        {/* Error Alert */}
        {error && (
          <View style={styles.alertError}>
            <Text style={styles.alertErrorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Radio Cards */}
        <Animated.View
          style={[
            styles.cards,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: card1Scale }] }}>
            <TouchableOpacity
              style={[
                styles.radioCard,
                {
                  borderColor: userType === 'self' ? '#0EA5E9' : '#E2E8F0',
                  backgroundColor: userType === 'self' ? '#F0F9FF' : '#FFFFFF',
                },
              ]}
              onPress={() => handleCardPress('self', card1Scale)}
              activeOpacity={0.85}
            >
              <View style={styles.radioCardContent}>
                <View
                  style={[
                    styles.radioIcon,
                    {
                      backgroundColor: userType === 'self' ? '#0EA5E9' + '18' : '#F1F5F9',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>👤</Text>
                </View>
                <View style={styles.radioCardText}>
                  <Text style={styles.radioTitle}>Just for me</Text>
                  <Text style={styles.radioDesc}>
                    I use oxygen tubing and want to track my own replacements.
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: userType === 'self' ? '#0EA5E9' : '#CBD5E1' },
                ]}
              >
                {userType === 'self' && (
                  <View style={[styles.radioInner, { backgroundColor: '#0EA5E9' }]} />
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: card2Scale }] }}>
            <TouchableOpacity
              style={[
                styles.radioCard,
                {
                  borderColor: userType === 'caregiver' ? '#0EA5E9' : '#E2E8F0',
                  backgroundColor: userType === 'caregiver' ? '#F0F9FF' : '#FFFFFF',
                },
              ]}
              onPress={() => handleCardPress('caregiver', card2Scale)}
              activeOpacity={0.85}
            >
              <View style={styles.radioCardContent}>
                <View
                  style={[
                    styles.radioIcon,
                    {
                      backgroundColor: userType === 'caregiver' ? '#0EA5E9' + '18' : '#F1F5F9',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>👥</Text>
                </View>
                <View style={styles.radioCardText}>
                  <Text style={styles.radioTitle}>I'm a caregiver</Text>
                  <Text style={styles.radioDesc}>
                    I help manage supplies for one or more people who use oxygen.
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: userType === 'caregiver' ? '#0EA5E9' : '#CBD5E1' },
                ]}
              >
                {userType === 'caregiver' && (
                  <View style={[styles.radioInner, { backgroundColor: '#0EA5E9' }]} />
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { opacity: (!userType || loading) ? 0.5 : 1 }]}
            onPress={handleContinue}
            disabled={!userType || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                userType
                  ? ['#38BDF8', '#0EA5E9', '#0284C7']
                  : ['#E2E8F0', '#CBD5E1', '#E2E8F0']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: userType ? '#FFFFFF' : '#94A3B8' },
                  ]}
                >
                  Continue →
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl },

  /* Heading */
  heading: { marginBottom: Spacing.lg },
  headingTitle: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Inter',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  headingSub: {
    fontSize: 15,
    fontFamily: 'Inter',
    color: '#64748B',
    marginTop: Spacing.xs,
    lineHeight: 22,
  },

  /* Alert */
  alertError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  alertErrorText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: '#DC2626',
  },

  /* Cards */
  cards: { gap: Spacing.md },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    padding: Spacing.md + 2,
    ...Shadows.sm,
  },
  radioCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  radioIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCardText: { flex: 1 },
  radioTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: '#1A1A2E',
    marginBottom: 3,
  },
  radioDesc: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#475569',
    lineHeight: 18,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  /* CTA */
  ctaContainer: { marginTop: 'auto', paddingBottom: Spacing.xl },
  primaryButton: {
    borderRadius: Radii.md,
    overflow: 'hidden',
    ...Shadows.glow('#0EA5E9'),
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: Radii.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
    letterSpacing: 0.3,
  },
});
