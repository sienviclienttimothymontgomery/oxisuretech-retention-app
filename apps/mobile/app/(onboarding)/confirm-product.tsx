import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { QRScanner } from '@/components/QRScanner';

const STEPS = ['Type', 'Product', 'Quantity', 'Done'];

export default function ConfirmProductScreen() {
  const router = useRouter();
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
    router.push('/(onboarding)/quantity');
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
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
                      i <= 1 ? colors.primary : colors.bgMuted,
                  },
                ]}
              >
                {i < 1 ? (
                  <Text style={[Typography.caption, { color: colors.textInverse }]}>✓</Text>
                ) : (
                  <Text
                    style={[
                      Typography.caption,
                      { color: i === 1 ? colors.textInverse : colors.textMuted },
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
                    color: i <= 1 ? colors.primary : colors.textMuted,
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
          <Text style={[Typography.h2, { color: colors.text }]}>Confirm Your Product</Text>
          <Text style={[Typography.small, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            {scannedProduct 
              ? 'We verified your product from the QR code. Is this correct?' 
              : 'We detected this product from your purchase. Is this correct?'}
          </Text>
        </View>

        {/* Product Card */}
        <View style={[styles.productCard, { borderColor: scannedProduct ? colors.success : colors.primary, backgroundColor: colors.bgSubtle }]}>
          <View style={[styles.productIcon, { backgroundColor: scannedProduct ? colors.success : colors.primary }]}>
            <Text style={{ fontSize: 28 }}>🫁</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={[Typography.bodyMedium, { color: colors.text }]}>
              {scannedProduct ? scannedProduct.name : 'OxiSure Oxygen Tubing'}
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              {scannedProduct ? `Standard 7ft Nasal Cannula - ${scannedProduct.pack}` : 'Standard 7ft Nasal Cannula'}
            </Text>
          </View>
          <View style={[styles.checkBadge, { backgroundColor: scannedProduct ? colors.success : colors.primary }]}>
            <Text style={{ color: colors.textInverse, fontSize: 14, fontWeight: '700' }}>✓</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.infoBg }]}>
          <Text style={[Typography.small, { color: colors.info, fontWeight: '500' }]}>
            Recommended replacement cycle: <Text style={{ fontWeight: '700' }}>Every 30 days</Text>
          </Text>
          <Text style={[Typography.caption, { color: colors.info, opacity: 0.7, marginTop: 4 }]}>
            Based on medical guidelines for continuous-use oxygen tubing.
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[Typography.bodyMedium, { color: colors.textInverse }]}>
                Yes, This Is Correct →
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ghostButton]}
            activeOpacity={0.7}
            onPress={() => setShowScanner(true)}
          >
            <Text style={[Typography.small, { color: colors.textSecondary }]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  stepItem: { alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: { marginBottom: Spacing.lg },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  productIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: { flex: 1 },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  ctaContainer: { marginTop: 'auto', paddingBottom: Spacing.xl, gap: Spacing.md },
  primaryButton: {
    borderRadius: Radii.sm,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  ghostButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
