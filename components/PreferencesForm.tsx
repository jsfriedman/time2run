import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/preferences';

export interface PreferencesFormProps {
  initialPreferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void | Promise<void>;
  testID?: string;
  onChange?: (prefs: UserPreferences) => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ initialPreferences, onSave, testID, onChange }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(initialPreferences || DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPreferences) setPrefs(initialPreferences);
  }, [initialPreferences]);

  const handleChange = (key: keyof UserPreferences, value: string) => {
    setPrefs((prev) => {
      const updated = {
        ...prev,
        [key]: key === 'maxTemperature' || key === 'preparationTime' || key === 'idealSleepHours' || key === 'preferredRunDuration' || key === 'bufferTimeBeforeExceed'
          ? Number(value)
          : value,
      };
      if (onChange) onChange(updated);
      return updated;
    });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setPrefs((prev) => {
        const updated = {
          ...prev,
          location: {
            ...prev.location,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        };
        if (onChange) onChange(updated);
        return updated;
      });
    });
  };

  const handleSave = async () => {
    setLoading(true);
    await AsyncStorage.setItem('userPreferences', JSON.stringify(prefs));
    await onSave(prefs);
    setLoading(false);
  };

  return (
    <View testID={testID}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Max Temperature (°F)</Text>
        <TextInput
          testID="max-temp-input"
          accessibilityLabel="Max Temperature"
          value={prefs.maxTemperature.toString()}
          onChangeText={(v) => handleChange('maxTemperature', v)}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Preparation Time (minutes)</Text>
        <TextInput
          testID="prep-time-input"
          accessibilityLabel="Preparation Time"
          value={prefs.preparationTime.toString()}
          onChangeText={(v) => handleChange('preparationTime', v)}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Ideal Sleep Hours</Text>
        <TextInput
          testID="sleep-hours-input"
          accessibilityLabel="Sleep Hours"
          value={prefs.idealSleepHours.toString()}
          onChangeText={(v) => handleChange('idealSleepHours', v)}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Buffer Time Before Hot (minutes)</Text>
        <TextInput
          testID="buffer-time-input"
          accessibilityLabel="Buffer Time"
          value={prefs.bufferTimeBeforeExceed.toString()}
          onChangeText={(v) => handleChange('bufferTimeBeforeExceed', v)}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Preferred Run Duration (minutes)</Text>
        <TextInput
          testID="run-duration-input"
          accessibilityLabel="Run Duration"
          value={prefs.preferredRunDuration.toString()}
          onChangeText={(v) => handleChange('preferredRunDuration', v)}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Preferred Default Run Time (HH:MM)</Text>
        <TextInput
          testID="preferred-default-time-input"
          accessibilityLabel="Preferred Default Run Time"
          value={prefs.preferredDefaultTime}
          onChangeText={(v) => handleChange('preferredDefaultTime', v)}
          keyboardType="default"
          style={styles.input}
        />
        <Text style={styles.label}>Coordinates</Text>
        <Text testID="coordinates-field" style={styles.input} selectable>
          {prefs.location.latitude}, {prefs.location.longitude}
        </Text>
        <Button title="Locate Me" onPress={handleLocateMe} />
        <Button
          title="Save"
          onPress={handleSave}
          accessibilityLabel="Save Preferences"
          disabled={loading}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
}); 