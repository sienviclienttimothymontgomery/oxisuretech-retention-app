import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Colors, Spacing, Typography, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleScan = async () => {
    try {
      // @capacitor/camera takes a photo via native intent. 
      // For true live barcode scanning, a plugin like @capacitor-mlkit/barcode-scanning is needed.
      // We simulate a successful scan here after the picture is taken.
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
      });
      
      if (image) {
         // Simulate finding the 2-pack tubing QR code
         onScan('KP-1V19-Z7P4');
      }
    } catch (e) {
      console.log('User cancelled camera or error:', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[Typography.bodyMedium, { color: colors.text, textAlign: 'center', marginBottom: Spacing.md }]}>
        Tap below to open the camera and take a picture of your product QR code.
      </Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleScan}>
        <Text style={{ color: colors.textInverse, fontWeight: '600' }}>Open Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.bgMuted, marginTop: Spacing.sm }]} onPress={onClose}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
      </TouchableOpacity>
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
});
