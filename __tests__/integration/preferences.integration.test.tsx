import React from 'react';
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react-native';
import { PreferencesProvider } from '../../components/PreferencesContext';
import PreferencesScreen, { handleUnsavedNavigation } from '../../app/(tabs)/preferences';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('Preferences UI Integration', () => {
  const defaultPrefs = {
    location: { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' },
    maxTemperature: 16,
    preparationTime: 30,
    idealSleepHours: 7,
    preferredRunDuration: 30,
    bufferTimeBeforeExceed: 90,
    preferredDefaultTime: '07:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
      if (key === 'userPreferences') return JSON.stringify(defaultPrefs);
      return null;
    });
  });

  it('allows user to change preferences and see them reflected', async () => {
    render(
      <PreferencesProvider>
        <PreferencesScreen />
      </PreferencesProvider>
    );
    await waitFor(() => expect(screen.getByLabelText(/max temp/i)).toBeTruthy());
    const maxTempInput = screen.getByLabelText(/max temp/i);
    fireEvent.changeText(maxTempInput, '18');
    const saveButton = screen.getByText(/save/i);
    fireEvent.press(saveButton);
    // Check that setItem was called with updated value
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userPreferences',
        expect.stringContaining('"maxTemperature":18')
      );
    });
  });

  it('does not show unsaved changes warning if navigating away after editing a field', async () => {
    render(
      <PreferencesProvider>
        <PreferencesScreen />
      </PreferencesProvider>
    );
    await waitFor(() => expect(screen.getByLabelText(/max temp/i)).toBeTruthy());
    const maxTempInput = screen.getByLabelText(/max temp/i);
    await act(async () => {
      fireEvent.changeText(maxTempInput, '80');
    });
    // Simulate navigation event
    const event = { preventDefault: jest.fn(), proceed: jest.fn() };
    // The new requirement: no warning, so handleUnsavedNavigation should return false
    const result = handleUnsavedNavigation(true, event);
    expect(result).toBe(false);
  });

  it('allows user to change preferred default time and see it reflected', async () => {
    render(
      <PreferencesProvider>
        <PreferencesScreen />
      </PreferencesProvider>
    );
    await waitFor(() => expect(screen.getByLabelText(/preferred default run time/i)).toBeTruthy());
    const preferredDefaultTimeInput = screen.getByLabelText(/preferred default run time/i);
    fireEvent.changeText(preferredDefaultTimeInput, '06:45');
    const saveButton = screen.getByText(/save/i);
    fireEvent.press(saveButton);
    // Check that setItem was called with updated value
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userPreferences',
        expect.stringContaining('"preferredDefaultTime":"06:45"')
      );
    });
  });
}); 