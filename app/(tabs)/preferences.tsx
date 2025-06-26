import * as React from 'react';
import { View } from 'react-native';
import { PreferencesForm } from '../../components/PreferencesForm';
import { PreferencesContext } from '../../components/PreferencesContext';

export default function PreferencesScreen() {
  const ctx = React.useContext(PreferencesContext);
  if (!ctx) return null;
  const { preferences, setPreferences, refreshAlarms } = ctx;

  const handleSave = async (prefs: typeof preferences) => {
    setPreferences(prefs);
    await refreshAlarms();
  };

  return (
    <View>
      <PreferencesForm testID="preferences-form" onSave={handleSave} initialPreferences={preferences} />
    </View>
  );
} 