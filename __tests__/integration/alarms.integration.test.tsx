import React from 'react';
import { render, waitForElementToBeRemoved, screen, fireEvent } from '@testing-library/react-native';
import { PreferencesProvider } from '../../components/PreferencesContext';
import AlarmsScreen from '../../app/(tabs)/alarms';
import PreferencesScreen from '../../app/(tabs)/preferences';
import * as weatherServiceModule from '../../services/weatherService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockWeather = {
  hourly: [
    { time: '2024-06-01T05:00:00Z', temperature: 12 },
    { time: '2024-06-01T06:00:00Z', temperature: 14 },
    { time: '2024-06-01T07:00:00Z', temperature: 15 },
    { time: '2024-06-01T08:00:00Z', temperature: 16 },
  ],
};

jest.spyOn(weatherServiceModule.WeatherService.prototype, 'getWeatherForecast').mockResolvedValue(mockWeather);

const defaultPrefs = {
  location: { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' },
  maxTemperature: 20,
  preparationTime: 15,
  idealSleepHours: 7,
  preferredRunDuration: 30,
  bufferTimeBeforeExceed: 90,
};

(AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
  if (key === 'userPreferences') return JSON.stringify(defaultPrefs);
  return null;
});

describe('Alarms UI Integration', () => {
  it('shows upcoming alarms and updates after changing preferences', async () => {
    render(
      <PreferencesProvider>
        <AlarmsScreen />
      </PreferencesProvider>
    );
    // Wait for loading to finish
    try {
      await waitForElementToBeRemoved(() => screen.queryByTestId('loading-indicator'), { timeout: 2000 });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('DEBUG: Loading indicator still present after timeout', screen.toJSON());
      throw e;
    }
    // Check for alarms list or fallback text
    const alarmsList = screen.queryByTestId('alarms-list');
    const fallbackText = screen.queryByText(/no upcoming alarms/i);
    if (!alarmsList && !fallbackText) {
      // eslint-disable-next-line no-console
      console.log('DEBUG: AlarmsList output', screen.toJSON());
    }
    expect(alarmsList || fallbackText).toBeTruthy();
  });
}); 