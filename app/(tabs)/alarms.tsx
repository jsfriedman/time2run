import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AlarmsList } from '../../components/AlarmsList';
import { PreferencesContext } from '../../components/PreferencesContext';

export default function AlarmsScreen() {
  const ctx = React.useContext(PreferencesContext);
  if (!ctx) return null;
  const { alarms, loading } = ctx;

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator testID="loading-indicator" /></View>;
  }

  return <AlarmsList alarms={alarms} />;
} 