import * as React from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PreferencesForm } from '../../components/PreferencesForm';
import { PreferencesContext } from '../../components/PreferencesContext';

export function handleUnsavedNavigation(unsaved: boolean, event: any) {
  // Per new requirement, never show a warning
  return false;
}

export default function PreferencesScreen() {
  const ctx = React.useContext(PreferencesContext);
  const router = useRouter();
  if (!ctx) return null;
  const { preferences, setPreferences, refreshAlarms } = ctx;

  const [unsaved, setUnsaved] = React.useState(false);
  const [localPrefs, setLocalPrefs] = React.useState(preferences);

  React.useEffect(() => {
    setLocalPrefs(preferences);
    setUnsaved(false);
  }, [preferences]);

  // Navigation guard for unsaved changes
  React.useEffect(() => {
    const beforeRemove = (event: any) => {
      handleUnsavedNavigation(unsaved, event);
    };
    // expo-router v2+ navigation guard
    // @ts-ignore
    router?.addListener?.('beforeRemove', beforeRemove);
    return () => {
      // @ts-ignore
      router?.removeListener?.('beforeRemove', beforeRemove);
    };
  }, [unsaved, router]);

  const handleChange = (newPrefs: typeof preferences) => {
    setLocalPrefs(newPrefs);
    setUnsaved(JSON.stringify(newPrefs) !== JSON.stringify(preferences));
  };

  const handleSave = async (prefs: typeof preferences) => {
    setPreferences(prefs);
    await refreshAlarms();
    setUnsaved(false);
  };

  return (
    <View>
      <PreferencesForm
        testID="preferences-form"
        onSave={handleSave}
        initialPreferences={localPrefs}
        onChange={handleChange}
      />
    </View>
  );
} 