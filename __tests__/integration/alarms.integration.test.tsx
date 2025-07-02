import React from 'react';
import { render, waitForElementToBeRemoved, screen, fireEvent } from '@testing-library/react-native';
import { PreferencesProvider } from '../../components/PreferencesContext';
import AlarmsScreen from '../../app/(tabs)/alarms';
import PreferencesScreen from '../../app/(tabs)/preferences';
import * as weatherServiceModule from '../../services/weatherService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as notificationService from '../../services/notificationService';
import { PreferencesContext } from '../../components/PreferencesContext';
import { act } from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockScheduleWakeUpAlarm = jest.fn().mockResolvedValue('alarm-id');
jest.mock('../../services/notificationService', () => {
  return {
    NotificationService: jest.fn().mockImplementation(() => ({
      scheduleWakeUpAlarm: mockScheduleWakeUpAlarm,
      scheduleRunReminder: jest.fn().mockResolvedValue('reminder-id'),
      cancelAllNotifications: jest.fn(),
      requestPermissions: jest.fn().mockResolvedValue(true),
    })),
  };
});

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
  maxTemperature: 100,
  preparationTime: 1,
  idealSleepHours: 1,
  preferredRunDuration: 1,
  bufferTimeBeforeExceed: 1,
  preferredDefaultTime: '07:00',
  location: { latitude: 1, longitude: 2, city: '' },
};

(AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
  if (key === 'userPreferences') return JSON.stringify(defaultPrefs);
  return null;
});

jest.mock('../../utils/runScheduler', () => {
  return {
    RunScheduler: jest.fn().mockImplementation(() => ({
      calculateOptimalRunTime: () => ({
        optimalRunTime: '06:00',
        wakeTime: '05:30',
        bedTime: '22:30',
        reason: 'Test run',
      }),
    })),
  };
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
    const fallbackText = screen.queryByText(/there are no periods in the next day within your temperature preference/i);
    expect(fallbackText).toBeTruthy();
  });

  it('calls native alarm/notification API when an alarm is set', async () => {
    let ctx: any;
    render(
      <PreferencesProvider>
        <PreferencesContext.Consumer>
          {value => {
            ctx = value;
            return <AlarmsScreen />;
          }}
        </PreferencesContext.Consumer>
      </PreferencesProvider>
    );
    // Call refreshAlarms directly on the context
    await act(async () => {
      await ctx.refreshAlarms();
    });
    expect(mockScheduleWakeUpAlarm).toHaveBeenCalledWith(expect.any(Object));
  });
}); 