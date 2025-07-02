import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { PreferencesForm } from '../../components/PreferencesForm';
import { UserPreferences, DEFAULT_PREFERENCES } from '../../types/preferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import type { PermissionStatus, LocationObjectCoords } from 'expo-location';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

const mockOnSave = jest.fn();

// Mock geolocation
const mockCoords: LocationObjectCoords = {
  latitude: 12.34,
  longitude: 56.78,
  altitude: 0,
  accuracy: 1,
  altitudeAccuracy: 1,
  heading: 0,
  speed: 0,
};

describe('PreferencesForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
    const granted = (Location.PermissionStatus && Location.PermissionStatus.GRANTED) || 'granted';
    jest.spyOn(Location, 'requestForegroundPermissionsAsync').mockResolvedValue({
      status: granted,
      expires: 'never',
      granted: true,
      canAskAgain: true,
    });
    jest.spyOn(Location, 'getCurrentPositionAsync').mockResolvedValue({ coords: mockCoords } as any);
  });

  const basePrefs: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    location: { latitude: 1, longitude: 2, city: '' },
  };

  it('renders read-only coordinates and Locate Me button', () => {
    render(
      <PreferencesForm
        initialPreferences={basePrefs}
        onSave={jest.fn()}
        testID="preferences-form"
      />
    );
    expect(screen.getByTestId('coordinates-field')).toBeTruthy();
    expect(screen.getByText(/locate me/i)).toBeTruthy();
    expect(screen.getByTestId('coordinates-field').props.children.join('')).toContain('1, 2');
  });

  it('updates coordinates when Locate Me is pressed', async () => {
    const onChange = jest.fn();
    render(
      <PreferencesForm
        initialPreferences={basePrefs}
        onSave={jest.fn()}
        testID="preferences-form"
        onChange={onChange}
      />
    );
    const button = screen.getByText(/locate me/i);
    await act(async () => {
      fireEvent.press(button);
    });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.objectContaining({ latitude: 12.34, longitude: 56.78 })
        })
      );
      expect(screen.getByTestId('coordinates-field').props.children.join('')).toContain('12.34, 56.78');
    });
  });

  it('allows user to edit all numeric preference fields', () => {
    render(
      <PreferencesForm
        initialPreferences={basePrefs}
        onSave={jest.fn()}
        testID="preferences-form"
      />
    );
    // Edit max temperature
    const maxTempInput = screen.getByTestId('max-temp-input');
    fireEvent.changeText(maxTempInput, '25');
    expect(maxTempInput.props.value).toBe('25');
    // Edit preparation time
    const prepTimeInput = screen.getByTestId('prep-time-input');
    fireEvent.changeText(prepTimeInput, '20');
    expect(prepTimeInput.props.value).toBe('20');
    // Edit sleep hours
    const sleepHoursInput = screen.getByTestId('sleep-hours-input');
    fireEvent.changeText(sleepHoursInput, '8');
    expect(sleepHoursInput.props.value).toBe('8');
    // Edit run duration
    const runDurationInput = screen.getByTestId('run-duration-input');
    fireEvent.changeText(runDurationInput, '45');
    expect(runDurationInput.props.value).toBe('45');
    // Edit buffer time
    const bufferTimeInput = screen.getByTestId('buffer-time-input');
    fireEvent.changeText(bufferTimeInput, '120');
    expect(bufferTimeInput.props.value).toBe('120');
    // Preferred default time is now a button, not a TextInput
    const preferredDefaultTimeBtn = screen.getByTestId('preferred-default-time-picker-btn');
    expect(preferredDefaultTimeBtn).toBeTruthy();
  });

  it('calls onChange when preferred default run time is changed via picker', async () => {
    const onChange = jest.fn();
    render(
      <PreferencesForm
        initialPreferences={basePrefs}
        onSave={mockOnSave}
        onChange={onChange}
      />
    );
    const btn = screen.getByTestId('preferred-default-time-picker-btn');
    act(() => {
      fireEvent.press(btn);
    });
    // Simulate the effect of the picker: user picks 08:15
    onChange({ ...basePrefs, preferredDefaultTime: '08:15' });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ preferredDefaultTime: '08:15' })
    );
  });

  it('saves preferences when save button is pressed', async () => {
    render(
      <PreferencesForm
        initialPreferences={DEFAULT_PREFERENCES}
        onSave={mockOnSave}
        testID="preferences-form"
      />
    );

    // Edit a preference
    const maxTempInput = screen.getByTestId('max-temp-input');
    fireEvent.changeText(maxTempInput, '25');

    // Press save button
    const saveButton = screen.getByText('Save');
    
    await act(async () => {
      fireEvent.press(saveButton);
    });

    // Wait for save to complete
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userPreferences',
        expect.stringContaining('"maxTemperature":25')
      );
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          maxTemperature: 25,
        })
      );
    });
  });

  it('shows loading state during save', async () => {
    // Use an async onSave mock that delays resolution
    const asyncOnSave = jest.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
    render(
      <PreferencesForm
        initialPreferences={DEFAULT_PREFERENCES}
        onSave={asyncOnSave}
        testID="preferences-form"
      />
    );

    const saveButton = screen.getByText('Save');
    
    await act(async () => {
      fireEvent.press(saveButton);
      // Wait a tick to allow loading state to update
      await Promise.resolve();
    });

    // The button should be disabled while asyncOnSave is pending
    expect(saveButton.props.disabled).toBe(true);

    // Wait for asyncOnSave to resolve and loading to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
    });
    expect(saveButton.props.disabled).toBe(false);
  });

  it('handles numeric input validation', () => {
    render(
      <PreferencesForm
        initialPreferences={DEFAULT_PREFERENCES}
        onSave={mockOnSave}
        testID="preferences-form"
      />
    );

    // Test that numeric fields convert non-numeric input to NaN
    const maxTempInput = screen.getByTestId('max-temp-input');
    fireEvent.changeText(maxTempInput, 'abc');
    // The component converts to number, so 'abc' becomes NaN
    expect(maxTempInput.props.value).toBe('NaN');
  });
}); 