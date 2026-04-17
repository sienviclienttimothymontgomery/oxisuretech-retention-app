import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  // The AuthProvider will automatically redirect the user to /(auth)/login or /(app)/dashboard
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
