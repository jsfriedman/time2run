import React from 'react';
import { render, waitForElementToBeRemoved, screen } from '@testing-library/react-native';
import { PreferencesProvider } from '../../components/PreferencesContext';
import HomeScreen from '../../app/(tabs)/index';
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

// Provide a default preferences mock
const defaultPrefs = {
  location: { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco' },
  maxTemperature: 16,
  preparationTime: 15,
  idealSleepHours: 7,
  preferredRunDuration: 30,
  bufferTimeBeforeExceed: 90,
};

(AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
  if (key === 'userPreferences') return JSON.stringify(defaultPrefs);
  return null;
});

describe('Home UI Integration', () => {
  it('shows next scheduled run and a summary of preferences', async () => {
    render(
      <PreferencesProvider>
        <HomeScreen />
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
    // Debug output if test fails
    if (!screen.queryByTestId('next-run-heading')) {
      // eslint-disable-next-line no-console
      console.log('DEBUG: HomeSummary output', screen.toJSON());
    }
    // Check for next run heading
    expect(screen.getByTestId('next-run-heading')).toBeTruthy();
    // Check for preferences summary
    expect(screen.getByTestId('home-summary')).toBeTruthy();
  });
}); 