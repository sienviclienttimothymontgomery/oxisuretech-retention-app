import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { QRScanner } from '@/components/QRScanner';

const STEPS = ['Type', 'Product', 'Quantity', 'Done'];

export default function ConfirmProductScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<{sku: string; name: string; pack: string} | null>(null);

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);

    const skuToSave = scannedProduct?.sku || 'OXI-TUB-07';

    await supabase
      .from('profiles')
      .update({ product_sku: skuToSave })
      .eq('id', user.id);

    setLoading(false);
    navigate('/(onboarding)/quantity');
  };

  const handleScan = (data: string) => {
    // Validate scanned data against known SKUs
    if (data.includes('KP-1V19-Z7P4') || data.toUpperCase() === 'KP-1V19-Z7P4') {
      setScannedProduct({ sku: 'KP-1V19-Z7P4', name: 'OxiSure Oxygen Tubing', pack: '2 Pack' });
      setShowScanner(false);
    } else if (data.includes('6H-NCN9-95CJ') || data.toUpperCase() === '6H-NCN9-95CJ') {
      setScannedProduct({ sku: '6H-NCN9-95CJ', name: 'OxiSure Oxygen Tubing', pack: '1 Pack' });
      setShowScanner(false);
    } else {
      Alert.alert(
        'Product Not Recognized',
        `The scanned code (${data}) is not a supported OxiSure product. Please try again or contact support.`
      );
    }
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
                      i <= 1 ? '#0EA5E9' : '#E2E8F0',
                    borderWidth: i > 1 ? 1 : 0,
                    borderColor: '#CBD5E1',
                  },
                ]}
              >
                {i < 1 ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : (
                  <Text
                    style={[
                      Typography.caption,
                      { color: i <= 1 ? '#FFFFFF' : '#94A3B8' },
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  Typography.caption,
                  {
                    color: i <= 1 ? '#0C5A8A' : '#94A3B8',
                    marginTop: 4,
                    fontWeight: i === 1 ? '600' : '400',
                  },
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Heading */}
        <View style={styles.heading}>
          <Text style={styles.headingTitle}>Confirm Your Product</Text>
          <Text style={styles.headingSub}>
            {scannedProduct 
              ? 'We verified your product from the QR code. Is this correct?' 
              : 'We detected this product from your purchase. Is this correct?'}
          </Text>
        </View>

        {/* Product Card */}
        <View
          style={[
            styles.productCard,
            {
              borderColor: scannedProduct ? '#4ADE80' : '#38BDF8',
            },
          ]}
        >
          <View
            style={[
              styles.productIcon,
              {
                backgroundColor: scannedProduct
                  ? 'rgba(74, 222, 128, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
              },
            ]}
          >
            <Text style={{ fontSize: 28 }}>🫁</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {scannedProduct ? scannedProduct.name : 'OxiSure Oxygen Tubing'}
            </Text>
            <Text style={styles.productDesc}>
              {scannedProduct ? `Standard 7ft Nasal Cannula - ${scannedProduct.pack}` : 'Standard 7ft Nasal Cannula'}
            </Text>
          </View>
          <View
            style={[
              styles.checkBadge,
              { backgroundColor: scannedProduct ? '#4ADE80' : '#0EA5E9' },
            ]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>✓</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Recommended replacement cycle: <Text style={{ fontWeight: '700' }}>Every 30 days</Text>
          </Text>
          <Text style={styles.infoSubtext}>
            Based on medical guidelines for continuous-use oxygen tubing.
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleConfirm}
            disabled={loading}
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
                  Yes, This Is Correct →
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostButton}
            activeOpacity={0.7}
            onPress={() => setShowScanner(true)}
          >
            <Text style={styles.ghostButtonText}>
              {scannedProduct ? 'Scan a different product' : "This isn't my product - Scan QR instead"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScanner(false)}
      >
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      </Modal>
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
  stepCheck: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
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

  /* Product Card */
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  productIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: { flex: 1 },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  productDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Info Box */
  infoBox: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoText: {
    fontSize: 14,
    color: '#0C5A8A',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  /* CTA */
  ctaContainer: { marginTop: 'auto', paddingBottom: Spacing.xl, gap: Spacing.md },
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
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  ghostButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  ghostButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
});
