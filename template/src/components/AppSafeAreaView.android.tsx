import React from 'react';
import {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaViewProps,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

export default function AppSafeAreaView(props: SafeAreaViewProps) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SafeAreaView {...props} />
    </SafeAreaProvider>
  );
}
