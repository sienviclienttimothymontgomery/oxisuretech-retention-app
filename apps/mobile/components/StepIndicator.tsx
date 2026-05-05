import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Typography } from '@/constants/theme';

type StepIndicatorProps = {
  steps: string[];
  currentStep: number; // 0-indexed
};

/**
 * Premium step indicator with connecting lines and animated completion states.
 */
export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isUpcoming = i > currentStep;

        return (
          <React.Fragment key={step}>
            {/* Connecting line (before each step except the first) */}
            {i > 0 && (
              <View style={styles.connectorWrapper}>
                {isCompleted || isCurrent ? (
                  <LinearGradient
                    colors={['#0EA5E9', '#38BDF8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.connectorFilled}
                  />
                ) : (
                  <View style={styles.connectorEmpty} />
                )}
              </View>
            )}

            {/* Step dot + label */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  isCompleted && styles.stepDotCompleted,
                  isCurrent && styles.stepDotCurrent,
                  isUpcoming && styles.stepDotUpcoming,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      { color: isCurrent ? '#FFFFFF' : '#94A3B8' },
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isCompleted || isCurrent ? '#0C5A8A' : '#94A3B8',
                    fontWeight: isCurrent ? '700' : isCompleted ? '500' : '400',
                  },
                ]}
              >
                {step}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  stepItem: {
    alignItems: 'center',
    minWidth: 48,
  },
  connectorWrapper: {
    flex: 1,
    height: 2,
    marginTop: 15, // Vertically center with the dot
    marginHorizontal: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  connectorFilled: {
    flex: 1,
    height: 2,
  },
  connectorEmpty: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: '#0EA5E9',
  },
  stepDotCurrent: {
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  stepDotUpcoming: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  stepCheck: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginTop: 4,
  },
});
