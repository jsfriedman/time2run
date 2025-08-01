import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { HomeSummary } from '../../components/HomeSummary';
import { PreferencesContext } from '../../components/PreferencesContext';

export default function HomeScreen() {
  const ctx = React.useContext(PreferencesContext);
  if (!ctx) return null;
  const { alarms, preferences, loading } = ctx;

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator testID="loading-indicator" /></View>;
  }

  return <HomeSummary nextRun={alarms[0] || null} preferences={preferences} />;
} 