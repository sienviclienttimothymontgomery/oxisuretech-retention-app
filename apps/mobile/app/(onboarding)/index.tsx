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
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS = ['Type', 'Product', 'Quantity', 'Done'];

export default function UserTypeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [userType, setUserType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    if (!userType || !user) return;
    setLoading(true);

    await supabase
      .from('profiles')
      .upsert({ id: user.id, user_type: userType, path_type: 'app' });

    setLoading(false);
    navigate('/(onboarding)/confirm-product');
  };

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      <View style={styles.content}>
        {/* Step Indicator */}
        <View style={styles.stepRow}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      i === 0 ? '#0EA5E9' : '#E2E8F0',
                    borderWidth: i === 0 ? 0 : 1,
                    borderColor: '#CBD5E1',
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.caption,
                    { color: i === 0 ? '#FFFFFF' : '#94A3B8' },
                  ]}
                >
                  {i + 1}
                </Text>
              </View>
              <Text
                style={[
                  Typography.caption,
                  {
                    color: i === 0 ? '#0C5A8A' : '#94A3B8',
                    marginTop: 4,
                    fontWeight: i === 0 ? '600' : '400',
                  },
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

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

        {/* Radio Cards */}
        <Animated.View
          style={[
            styles.cards,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.radioCard,
              {
                borderColor: userType === 'self' ? '#1976D2' : '#CBD5E1',
                backgroundColor:
                  userType === 'self'
                    ? '#E8F4FD'
                    : '#F5F8FC',
              },
            ]}
            onPress={() => setUserType('self')}
            activeOpacity={0.85}
          >
            <View style={styles.radioCardContent}>
              <View
                style={[
                  styles.radioIcon,
                  {
                    backgroundColor:
                      userType === 'self'
                        ? 'rgba(25, 118, 210, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
              <View style={styles.radioCardText}>
                <Text style={[styles.radioTitle, { color: '#1A2A4A' }]}>Just for me</Text>
                <Text style={[styles.radioDesc, { color: '#475569' }]}>
                  I use oxygen tubing and want to track my own replacements.
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radioOuter,
                {
                  borderColor: userType === 'self' ? '#1976D2' : '#94A3B8',
                },
              ]}
            >
              {userType === 'self' && (
                <View style={[styles.radioInner, { backgroundColor: '#1976D2' }]} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.radioCard,
              {
                borderColor: userType === 'caregiver' ? '#1976D2' : '#CBD5E1',
                backgroundColor:
                  userType === 'caregiver'
                    ? '#E8F4FD'
                    : '#F5F8FC',
              },
            ]}
            onPress={() => setUserType('caregiver')}
            activeOpacity={0.85}
          >
            <View style={styles.radioCardContent}>
              <View
                style={[
                  styles.radioIcon,
                  {
                    backgroundColor:
                      userType === 'caregiver'
                        ? 'rgba(25, 118, 210, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>👥</Text>
              </View>
              <View style={styles.radioCardText}>
                <Text style={[styles.radioTitle, { color: '#1A2A4A' }]}>I'm a caregiver</Text>
                <Text style={[styles.radioDesc, { color: '#475569' }]}>
                  I help manage supplies for one or more people who use oxygen.
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radioOuter,
                {
                  borderColor: userType === 'caregiver' ? '#1976D2' : '#94A3B8',
                },
              ]}
            >
              {userType === 'caregiver' && (
                <View style={[styles.radioInner, { backgroundColor: '#1976D2' }]} />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleContinue}
            disabled={!userType || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                userType
                  ? ['#38BDF8', '#0EA5E9', '#0284C7']
                  : ['#E2E8F0', '#CBD5E1']
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

  /* Steps */
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  stepItem: { alignItems: 'center' },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Heading */
  heading: { marginBottom: Spacing.lg },
  headingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  headingSub: {
    fontSize: 15,
    color: '#64748B',
    marginTop: Spacing.xs,
    lineHeight: 22,
  },

  /* Cards */
  cards: { gap: Spacing.md },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  radioCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  radioIcon: {
    width: 42,
    height: 42,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCardText: { flex: 1 },
  radioTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  radioDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
