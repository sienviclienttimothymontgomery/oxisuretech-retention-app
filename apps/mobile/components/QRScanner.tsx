import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, Typography, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[Typography.bodyMedium, { color: colors.text, textAlign: 'center', marginBottom: Spacing.md }]}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={{ color: colors.textInverse, fontWeight: '600' }}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.bgMuted, marginTop: Spacing.sm }]} onPress={onClose}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'code128', 'code39', 'upc_a', 'upc_e', 'ean13', 'ean8', 'pdf417', 'aztec', 'datamatrix'],
        }}
        onBarcodeScanned={({ data }) => {
          onScan(data);
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={[Typography.bodyMedium, { color: 'white' }]}>Scan Product QR or Barcode</Text>
        </View>
        <View style={styles.reticleContainer}>
          <View style={styles.reticle} />
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Cancel Scanning</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radii.sm,
    width: '100%',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  reticleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticle: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: Radii.sm,
    backgroundColor: 'transparent',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radii.round,
  },
});
