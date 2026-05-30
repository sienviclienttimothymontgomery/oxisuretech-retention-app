import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle as SvgCircle } from 'react-native-svg';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Colors, Spacing, Radii, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import logoImage from '@/assets/images/logo.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [fullName, setFullName] = useState('');
  const [fullNameFocused, setFullNameFocused] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(cardTranslate, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous subtle pulse on the logo glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Floating orb animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim1, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(orbAnim1, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim2, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(orbAnim2, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const handleSubmit = async () => {
    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setError('Please enter a password (at least 6 characters).');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const { error: authError } = isSignUp
      ? await signUpWithEmail(email, password, fullName.trim())
      : await signInWithEmail(email, password);

    if (authError) {
      setError(authError.message);
    } else if (isSignUp) {
      setMessage('Check your email to confirm your account.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setError(null);
    setMessage(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'com.anonymous.oxisuretechmobile://login-callback',
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('Check your email for a password reset link.');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    setMessage(null);

    const { error: googleError } = await signInWithGoogle();

    if (googleError) {
      setError(googleError.message);
    }
    setGoogleLoading(false);
  };

  const openLink = (url: string) => {
    Browser.open({ url }).catch(console.error);
  };

  const logoSpin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '0deg'],
  });

  const orbTranslateY1 = orbAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });
  const orbTranslateY2 = orbAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      {/* Floating Decorative Orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orbTopRight,
          { transform: [{ translateY: orbTranslateY1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbBottomLeft,
          { transform: [{ translateY: orbTranslateY2 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbCenter,
          { transform: [{ translateY: orbTranslateY1 }] },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Brand Logo */}
          <Animated.View
            style={[
              styles.logoArea,
              {
                transform: [
                  { scale: logoScale },
                  { rotate: logoSpin },
                ],
              },
            ]}
          >
            <Animated.View style={[styles.logoGlow, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.logoBackdrop}>
                <Image
                  source={logoImage}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
            <Text style={styles.brandTagline}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.glassCard,
              {
                transform: [{ translateY: cardTranslate }],
                opacity: cardOpacity,
              },
              isSignUp && { borderTopWidth: 4, borderTopColor: '#0EA5E9' }
            ]}
          >
            {/* Status Messages */}
            {error && (
              <View style={[styles.alert, styles.alertError]}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertText}>{error}</Text>
              </View>
            )}
            {message && (
              <View style={[styles.alert, styles.alertSuccess]}>
                <Text style={styles.alertIcon}>✅</Text>
                <Text style={styles.alertTextSuccess}>{message}</Text>
              </View>
            )}

            {/* Full Name Input */}
            {isSignUp && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: fullNameFocused ? colors.accent : colors.border,
                      ...(fullNameFocused ? Shadows.glow(colors.accent + '40') : {}),
                    },
                  ]}
                >
                  <View style={[styles.inputIconCircle, { backgroundColor: fullNameFocused ? '#EFF6FF' : '#F8FAFC' }]}>
                    <UserIcon color={fullNameFocused ? colors.accent : colors.textMuted} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. John Doe"
                    placeholderTextColor={colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    onFocus={() => setFullNameFocused(true)}
                    onBlur={() => setFullNameFocused(false)}
                  />
                </View>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: emailFocused ? colors.accent : colors.border,
                    ...(emailFocused ? Shadows.glow(colors.accent + '40') : {}),
                  },
                ]}
              >
                <View style={[styles.inputIconCircle, { backgroundColor: emailFocused ? '#EFF6FF' : '#F8FAFC' }]}>
                  <MailIcon color={emailFocused ? colors.accent : colors.textMuted} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: passwordFocused ? colors.accent : colors.border,
                    ...(passwordFocused ? Shadows.glow(colors.accent + '40') : {}),
                  },
                ]}
              >
                <View style={[styles.inputIconCircle, { backgroundColor: passwordFocused ? '#EFF6FF' : '#F8FAFC' }]}>
                  <LockIcon color={passwordFocused ? colors.accent : colors.textMuted} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? <EyeOffIcon color={colors.textMuted} /> : <EyeIcon color={colors.textMuted} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            {!isSignUp && (
              <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Primary CTA */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { opacity: loading ? 0.7 : 1 },
                ]}
                onPress={handleSubmit}
                disabled={loading || googleLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#38BDF8', '#0EA5E9', '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Toggle Sign Up / Sign In */}
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
            >
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.toggleLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            {!isSignUp && (
              <View style={styles.dividerRow}>
                <LinearGradient
                  colors={['transparent', '#CBD5E1', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerGradient}
                />
                <Text style={styles.dividerText}>or continue with</Text>
                <LinearGradient
                  colors={['transparent', '#CBD5E1', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerGradient}
                />
              </View>
            )}

            {/* OAuth Buttons */}
            {!isSignUp && (
              <View style={styles.oauthRow}>
                <TouchableOpacity
                  style={styles.oauthButton}
                  activeOpacity={0.75}
                  onPress={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <View style={styles.oauthButtonContent}>
                      <View style={styles.oauthIconCircle}>
                        <GoogleIcon size={18} />
                      </View>
                      <Text style={styles.oauthButtonText}>Google</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.oauthButton}
                  activeOpacity={0.75}
                >
                  <View style={styles.oauthButtonContent}>
                    <View style={[styles.oauthIconCircle, { backgroundColor: '#1A1A2E' }]}>
                      <AppleIcon size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.oauthButtonText}>Apple</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink} onPress={() => openLink('https://oxisuretechsolutions.com/terms')}>Terms</Text> &{' '}
            <Text style={styles.footerLink} onPress={() => openLink('https://oxisuretechsolutions.com/privacy')}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ──── SVG Icon Components ──── */

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon({ size = 20, color = '#FFFFFF' }: { size?: number, color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.53 8.72 9.28c1.32.07 2.24.75 3.01.8.99-.2 1.94-.78 3-.72 1.28.08 2.24.59 2.87 1.5-2.63 1.57-2.01 5.01.34 5.97-.5 1.3-.92 2.59-1.89 3.45zM12.05 9.19c-.13-2.31 1.79-4.29 3.95-4.19.27 2.55-2.31 4.46-3.95 4.19z" />
    </Svg>
  );
}

function MailIcon({ color = "rgba(255,255,255,0.5)" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="1.5" />
      <Path d="M2 7l10 6 10-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function UserIcon({ color = "rgba(255,255,255,0.5)" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <SvgCircle
        cx="12"
        cy="7"
        r="4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({ color = "rgba(255,255,255,0.5)" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="3" stroke={color} strokeWidth="1.5" />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function EyeIcon({ color = "rgba(255,255,255,0.45)" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={color}
        strokeWidth="1.5"
      />
      <SvgCircle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

function EyeOffIcon({ color = "rgba(255,255,255,0.45)" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path d="M1 1l22 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

/* ──── Styles ──── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },

  /* Decorative Orbs */
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orbTopRight: {
    width: 280,
    height: 280,
    backgroundColor: '#38BDF8',
    opacity: 0.04,
    top: -80,
    right: -80,
  },
  orbBottomLeft: {
    width: 220,
    height: 220,
    backgroundColor: '#0EA5E9',
    opacity: 0.05,
    bottom: -60,
    left: -90,
  },
  orbCenter: {
    width: 160,
    height: 160,
    backgroundColor: '#7DD3FC',
    opacity: 0.03,
    top: '50%',
    right: -40,
  },

  /* Logo Area */
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoGlow: {
    marginBottom: Spacing.sm,
  },
  logoBackdrop: {
    padding: Spacing.sm,
    borderRadius: Radii.xl,
  },
  logoImage: {
    width: 240,
    height: 140,
  },
  brandTagline: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: '#475569',
    marginTop: Spacing.xs,
    letterSpacing: 0.2,
  },

  /* Form Card */
  glassCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: '#FFFFFF',
    ...Shadows.lg,
  },

  /* Alerts */
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    gap: Spacing.sm,
  },
  alertError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  alertIcon: {
    fontSize: 14,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#DC2626',
    fontWeight: '500',
  },
  alertTextSuccess: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#16A34A',
    fontWeight: '500',
  },

  /* Inputs */
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#475569',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radii.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm,
    minHeight: 54,
  },
  inputIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#1A1A2E',
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 6,
  },

  /* Forgot Password */
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#0C5A8A',
    fontWeight: '600',
  },

  /* Primary Button */
  primaryButton: {
    borderRadius: Radii.md,
    overflow: 'hidden',
    marginTop: Spacing.xs,
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
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* Toggle */
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#475569',
  },
  toggleLink: {
    color: '#0C5A8A',
    fontWeight: '700',
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerGradient: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#94A3B8',
    marginHorizontal: Spacing.md,
    textTransform: 'uppercase',
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  /* OAuth Buttons */
  oauthRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  oauthButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm + 2,
  },
  oauthIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oauthButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#1F2937',
  },

  /* Footer */
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
  footerLink: {
    color: '#475569',
    fontWeight: '600',
  },
});
