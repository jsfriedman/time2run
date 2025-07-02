import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HomeSummary } from '../../components/HomeSummary';
import { RunSchedule, UserPreferences, DEFAULT_PREFERENCES } from '../../types/preferences';

describe('HomeSummary', () => {
  const mockNextRun: RunSchedule = {
    optimalRunTime: '06:00',
    wakeTime: '05:30',
    bedTime: '22:30',
    reason: 'Optimal temperature for running',
  };

  it('renders next run information when available', () => {
    render(
      <HomeSummary
        nextRun={mockNextRun}
        preferences={DEFAULT_PREFERENCES}
      />
    );

    expect(screen.getByTestId('home-summary')).toBeTruthy();
    expect(screen.getByTestId('next-run-heading')).toBeTruthy();
    expect(screen.getByText('Next Run')).toBeTruthy();
    expect(screen.getByText('06:00')).toBeTruthy();
    expect(screen.getByText('Wake: 05:30 | Bed: 22:30')).toBeTruthy();
    expect(screen.getByText('Optimal temperature for running')).toBeTruthy();
  });

  it('shows no run message when nextRun is null', () => {
    render(
      <HomeSummary
        nextRun={null}
        preferences={DEFAULT_PREFERENCES}
      />
    );

    expect(screen.getByTestId('home-summary')).toBeTruthy();
    expect(screen.getByText('No run scheduled yet.')).toBeTruthy();
    // The heading is still shown even when there's no run
    expect(screen.getByTestId('next-run-heading')).toBeTruthy();
  });

  it('displays preferences summary', () => {
    render(
      <HomeSummary
        nextRun={mockNextRun}
        preferences={DEFAULT_PREFERENCES}
      />
    );

    expect(screen.getByText('Preferences Summary')).toBeTruthy();
    expect(screen.getByText(`Max Temp: ${DEFAULT_PREFERENCES.maxTemperature}°F`)).toBeTruthy();
    expect(screen.getByText(`Prep: ${DEFAULT_PREFERENCES.preparationTime} min`)).toBeTruthy();
    expect(screen.getByText(`Sleep: ${DEFAULT_PREFERENCES.idealSleepHours} hrs`)).toBeTruthy();
    expect(screen.getByText(`Buffer: ${DEFAULT_PREFERENCES.bufferTimeBeforeExceed} min`)).toBeTruthy();
    expect(screen.getByText(`Run Duration: ${DEFAULT_PREFERENCES.preferredRunDuration} min`)).toBeTruthy();
    expect(screen.getByText(`Location: ${DEFAULT_PREFERENCES.location.city} (${DEFAULT_PREFERENCES.location.latitude}, ${DEFAULT_PREFERENCES.location.longitude})`)).toBeTruthy();
    expect(screen.getByText(`Preferred Default Time: ${DEFAULT_PREFERENCES.preferredDefaultTime}`)).toBeTruthy();
  });

  it('displays custom preferences correctly', () => {
    const customPreferences: UserPreferences = {
      location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
      maxTemperature: 25,
      preparationTime: 20,
      idealSleepHours: 8,
      preferredRunDuration: 45,
      bufferTimeBeforeExceed: 120,
      preferredDefaultTime: '06:30',
    };

    render(
      <HomeSummary
        nextRun={mockNextRun}
        preferences={customPreferences}
      />
    );

    expect(screen.getByText('Max Temp: 25°F')).toBeTruthy();
    expect(screen.getByText('Prep: 20 min')).toBeTruthy();
    expect(screen.getByText('Sleep: 8 hrs')).toBeTruthy();
    expect(screen.getByText('Buffer: 120 min')).toBeTruthy();
    expect(screen.getByText('Run Duration: 45 min')).toBeTruthy();
    expect(screen.getByText('Location: New York (40.7128, -74.006)')).toBeTruthy();
    expect(screen.getByText('Preferred Default Time: 06:30')).toBeTruthy();
  });

  it('handles next run with empty reason', () => {
    const nextRunWithEmptyReason: RunSchedule = {
      optimalRunTime: '06:00',
      wakeTime: '05:30',
      bedTime: '22:30',
      reason: '',
    };

    render(
      <HomeSummary
        nextRun={nextRunWithEmptyReason}
        preferences={DEFAULT_PREFERENCES}
      />
    );

    expect(screen.getByText('06:00')).toBeTruthy();
    expect(screen.getByText('Wake: 05:30 | Bed: 22:30')).toBeTruthy();
    // Empty reason should still render (empty string)
    expect(screen.getByText('')).toBeTruthy();
  });

  it('renders both next run and preferences when both are available', () => {
    render(
      <HomeSummary
        nextRun={mockNextRun}
        preferences={DEFAULT_PREFERENCES}
      />
    );

    // Check next run section
    expect(screen.getByText('Next Run')).toBeTruthy();
    expect(screen.getByText('06:00')).toBeTruthy();
    
    // Check preferences section
    expect(screen.getByText('Preferences Summary')).toBeTruthy();
    expect(screen.getByText(`Max Temp: ${DEFAULT_PREFERENCES.maxTemperature}°F`)).toBeTruthy();
  });
}); 