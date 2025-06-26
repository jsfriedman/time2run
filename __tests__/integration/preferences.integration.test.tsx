import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react-native';
import { PreferencesProvider } from '../../components/PreferencesContext';
import PreferencesScreen from '../../app/(tabs)/preferences';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const defaultPrefs = {
  location: { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' },
  maxTemperature: 16,
  preparationTime: 30,
  idealSleepHours: 7,
  preferredRunDuration: 30,
  bufferTimeBeforeExceed: 90,
};

(AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
  if (key === 'userPreferences') return JSON.stringify(defaultPrefs);
  return null;
});

describe('Preferences UI Integration', () => {
  it('allows user to change preferences and see them reflected', async () => {
    render(
      <PreferencesProvider>
        <PreferencesScreen />
      </PreferencesProvider>
    );
    // Wait for form to load
    await waitFor(() => expect(screen.getByLabelText(/max temp/i)).toBeTruthy());
    // Change max temperature
    const maxTempInput = screen.getByLabelText(/max temp/i);
    fireEvent.changeText(maxTempInput, '18');
    // Save
    const saveButton = screen.getByText(/save/i);
    fireEvent.press(saveButton);
    // Check that setItem was called with updated value
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userPreferences',
        expect.stringContaining('18')
      );
    });
  });
}); 