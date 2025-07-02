import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/preferences';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface PreferencesFormProps {
  initialPreferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void | Promise<void>;
  testID?: string;
  onChange?: (prefs: UserPreferences) => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ initialPreferences, onSave, testID, onChange }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(initialPreferences || DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  const handleLocateMe = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setPrefs((prev) => {
        const updated = {
          ...prev,
          location: {
            ...prev.location,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        };
        if (onChange) onChange(updated);
        return updated;
      });
    } catch (e) {
      alert('Failed to get location. Please try again.');
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      handleChange('preferredDefaultTime', formatted);
    }
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
        <Button
          testID="preferred-default-time-picker-btn"
          title={prefs.preferredDefaultTime || 'Set Time'}
          onPress={() => setShowTimePicker(true)}
        />
        {showTimePicker && (
          <DateTimePicker
            value={(() => {
              const [h, m] = (prefs.preferredDefaultTime || '07:00').split(':').map(Number);
              const d = new Date();
              d.setHours(h, m, 0, 0);
              return d;
            })()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
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