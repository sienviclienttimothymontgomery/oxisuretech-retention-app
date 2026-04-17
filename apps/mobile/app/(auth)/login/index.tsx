import React, { useState } from 'react';
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
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { color: colors.textInverse }]}>O</Text>
          </View>
          <Text style={[Typography.h1, { color: colors.text, marginTop: Spacing.lg }]}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' }]}>
            {isSignUp
              ? 'Set up your OxiSure account.'
              : 'Sign in to your OxiSure account.'}
          </Text>
        </View>

        {/* Status Messages */}
        {error && (
          <View style={[styles.alert, { backgroundColor: colors.dangerBg }]}>
            <Text style={[Typography.small, { color: colors.danger }]}>{error}</Text>
          </View>
        )}
        {message && (
          <View style={[styles.alert, { backgroundColor: colors.successBg }]}>
            <Text style={[Typography.small, { color: colors.success }]}>{message}</Text>
          </View>
        )}

        {/* Input Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[Typography.label, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
              Email address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bgSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[Typography.label, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
              Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bgSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[Typography.bodyMedium, { color: colors.textInverse }]}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Sign Up / Sign In */}
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
          >
            <Text style={[Typography.small, { color: colors.textSecondary }]}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[Typography.caption, { color: colors.textMuted, marginHorizontal: Spacing.sm }]}>
              Or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthRow}>
            <TouchableOpacity
              style={[styles.oauthButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              activeOpacity={0.8}
            >
              <Text style={[Typography.bodyMedium, { color: colors.text }]}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.oauthButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              activeOpacity={0.8}
            >
              <Text style={[Typography.bodyMedium, { color: colors.text }]}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
  },
  alert: {
    padding: Spacing.md,
    borderRadius: Radii.sm,
    marginBottom: Spacing.md,
  },
  form: {
    gap: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
  },
  primaryButton: {
    borderRadius: Radii.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: Spacing.sm,
  },
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  oauthRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  oauthButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
});
