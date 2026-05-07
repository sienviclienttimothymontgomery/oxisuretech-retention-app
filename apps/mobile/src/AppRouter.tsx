import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../providers/AuthProvider';

import IndexScreen from '../app/index';
import LoginScreen from '../app/(auth)/login/index';
import DashboardScreen from '../app/(app)/dashboard/index';
import AdminDashboardScreen from '../app/(app)/admin/index';
import SettingsScreen from '../app/(app)/settings/index';
import OnboardingIndexScreen from '../app/(onboarding)/index';
import OnboardingWelcomeScreen from '../app/(onboarding)/welcome';
import OnboardingConfirmProductScreen from '../app/(onboarding)/confirm-product';
import OnboardingQuantityScreen from '../app/(onboarding)/quantity';
import OnboardingNotificationsScreen from '../app/(onboarding)/notifications';

export default function AppRouter() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<IndexScreen />} />
          <Route path="/(auth)/login" element={<LoginScreen />} />
          <Route path="/(app)/dashboard" element={<DashboardScreen />} />
          <Route path="/(app)/admin" element={<AdminDashboardScreen />} />
          <Route path="/(app)/settings" element={<SettingsScreen />} />
          <Route path="/(onboarding)" element={<OnboardingIndexScreen />} />
          <Route path="/(onboarding)/welcome" element={<OnboardingWelcomeScreen />} />
          <Route path="/(onboarding)/confirm-product" element={<OnboardingConfirmProductScreen />} />
          <Route path="/(onboarding)/quantity" element={<OnboardingQuantityScreen />} />
          <Route path="/(onboarding)/notifications" element={<OnboardingNotificationsScreen />} />
          {/* Catch-all: redirect unknown paths to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
