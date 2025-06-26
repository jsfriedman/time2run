import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/preferences';

export interface PreferencesFormProps {
  initialPreferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void | Promise<void>;
  testID?: string;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ initialPreferences, onSave, testID }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(initialPreferences || DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPreferences) setPrefs(initialPreferences);
  }, [initialPreferences]);

  const handleChange = (key: keyof UserPreferences, value: string) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: key === 'location'
        ? { ...prev.location, city: value }
        : key === 'maxTemperature' || key === 'preparationTime' || key === 'idealSleepHours' || key === 'preferredRunDuration' || key === 'bufferTimeBeforeExceed'
          ? Number(value)
          : value,
    }));
  };

  const handleLocationChange = (key: keyof UserPreferences['location'], value: string) => {
    setPrefs((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [key]: key === 'latitude' || key === 'longitude' ? Number(value) : value,
      },
    }));
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
        <Text style={styles.label}>Location (City)</Text>
        <TextInput
          testID="city-input"
          accessibilityLabel="City"
          value={prefs.location.city}
          onChangeText={(v) => handleLocationChange('city', v)}
          style={styles.input}
        />
        <Text style={styles.label}>Latitude</Text>
        <TextInput
          testID="latitude-input"
          accessibilityLabel="Latitude"
          value={prefs.location.latitude.toString()}
          onChangeText={(v) => handleLocationChange('latitude', v)}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.label}>Longitude</Text>
        <TextInput
          testID="longitude-input"
          accessibilityLabel="Longitude"
          value={prefs.location.longitude.toString()}
          onChangeText={(v) => handleLocationChange('longitude', v)}
          keyboardType="numeric"
          style={styles.input}
        />
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