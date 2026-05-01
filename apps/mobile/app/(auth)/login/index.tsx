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

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // Logo entrance: scale + gentle rotation
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
      // Card slides up + fades in
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
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    // Button press micro-animation
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const { error: authError } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    if (authError) {
      setError(authError.message);
    } else if (isSignUp) {
      setMessage('Check your email to confirm your account.');
    }
    setLoading(false);
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

  const logoSpin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

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
              <Image
                source={logoImage}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
            <Text style={styles.brandTagline}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>
          </Animated.View>

          {/* Glassmorphism Form Card */}
          <Animated.View
            style={[
              styles.glassCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                transform: [{ translateY: cardTranslate }],
                opacity: cardOpacity,
              },
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

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: emailFocused ? colors.primary : colors.border,
                  },
                ]}
              >
                <MailIcon color={colors.icon} />
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
                    backgroundColor: '#FFFFFF',
                    borderColor: passwordFocused ? colors.primary : colors.border,
                  },
                ]}
              >
                <LockIcon color={colors.icon} />
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
                  {showPassword ? <EyeOffIcon color={colors.icon} /> : <EyeIcon color={colors.icon} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            {!isSignUp && (
              <TouchableOpacity style={styles.forgotButton}>
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
                <View
                  style={[styles.primaryButtonGradient, { backgroundColor: colors.primary }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </View>
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
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthRow}>
              <TouchableOpacity
                style={[styles.oauthButton, { borderColor: colors.border }]}
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <View style={styles.oauthButtonContent}>
                    <GoogleIcon size={20} />
                    <Text style={styles.oauthButtonText}>Google</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.oauthButton, { borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <View style={styles.oauthButtonContent}>
                  <AppleIcon size={20} color={colors.text} />
                  <Text style={styles.oauthButtonText}>Apple</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms</Text> &{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
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
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
      <Rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="1.5" />
      <Path d="M2 7l10 6 10-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function LockIcon({ color = "rgba(255,255,255,0.5)" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
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
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.08,
  },
  orbTopRight: {
    width: 300,
    height: 300,
    backgroundColor: '#38BDF8',
    top: -80,
    right: -80,
  },
  orbBottomLeft: {
    width: 250,
    height: 250,
    backgroundColor: '#0EA5E9',
    bottom: -60,
    left: -100,
  },
  orbCenter: {
    width: 180,
    height: 180,
    backgroundColor: '#7DD3FC',
    top: '45%',
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
  logoImage: {
    width: 250,
    height: 150,
  },
  brandTagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569', // colors.textSecondary
    marginTop: Spacing.xs,
  },

  /* Glass Card -> Solid Card */
  glassCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.lg,
  },

  /* Alerts */
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    gap: Spacing.sm,
  },
  alertError: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
  },
  alertSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  alertIcon: {
    fontSize: 14,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#F87171',
    fontWeight: '500',
  },
  alertTextSuccess: {
    flex: 1,
    fontSize: 13,
    color: '#4ADE80',
    fontWeight: '500',
  },

  /* Inputs */
  inputWrapper: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569', // colors.textSecondary
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.sm, // 8px
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E', // colors.text
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 4,
  },

  /* Forgot Password */
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: '#0C5A8A', // colors.primary
    fontWeight: '600',
  },

  /* Primary Button */
  primaryButton: {
    borderRadius: Radii.sm, // 8px
    overflow: 'hidden',
    marginTop: Spacing.xs,
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
    color: '#475569', // colors.textSecondary
  },
  toggleLink: {
    color: '#0C5A8A', // colors.primary
    fontWeight: '600',
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0', // colors.border
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8', // colors.textMuted
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
    borderWidth: 1,
    borderRadius: Radii.sm, // 8px
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    backgroundColor: '#FFFFFF',
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  oauthButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937', // Google Brand Guideline dark text
  },

  /* Footer */
  footerText: {
    fontSize: 12,
    color: '#94A3B8', // colors.textMuted
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
  footerLink: {
    color: '#475569', // colors.textSecondary
    fontWeight: '500',
  },
});
