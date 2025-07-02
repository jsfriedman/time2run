import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AlarmsList } from '../../components/AlarmsList';
import { RunSchedule } from '../../types/preferences';

describe('AlarmsList', () => {
  const mockAlarms: RunSchedule[] = [
    {
      optimalRunTime: '06:00',
      wakeTime: '05:30',
      bedTime: '22:30',
      reason: 'Optimal temperature for running',
    },
    {
      optimalRunTime: '07:00',
      wakeTime: '06:30',
      bedTime: '23:30',
      reason: 'Good weather conditions',
    },
  ];

  it('renders alarms list when alarms are provided', () => {
    render(<AlarmsList alarms={mockAlarms} />);

    expect(screen.getByTestId('alarms-list')).toBeTruthy();
    expect(screen.getByTestId('alarms-heading')).toBeTruthy();
    expect(screen.getByText('Alarms')).toBeTruthy();
    
    // Check that both alarms are rendered
    expect(screen.getByText('06:00 (Run)')).toBeTruthy();
    expect(screen.getByText('07:00 (Run)')).toBeTruthy();
    expect(screen.getByText('Wake: 05:30 | Bed: 22:30')).toBeTruthy();
    expect(screen.getByText('Wake: 06:30 | Bed: 23:30')).toBeTruthy();
    expect(screen.getByText('Optimal temperature for running')).toBeTruthy();
    expect(screen.getByText('Good weather conditions')).toBeTruthy();
  });

  it('shows empty state when no alarms are provided and weatherChecked is true', () => {
    render(<AlarmsList alarms={[]} weatherChecked={true} />);
    expect(screen.getByText('There are no periods in the next day within your temperature preference.')).toBeTruthy();
    expect(screen.queryByTestId('alarms-heading')).toBeFalsy();
  });

  it('does not show empty state when no alarms and weatherChecked is false', () => {
    render(<AlarmsList alarms={[]} weatherChecked={false} />);
    expect(screen.queryByText('There are no periods in the next day within your temperature preference.')).toBeFalsy();
  });

  it('shows empty state when alarms is null and weatherChecked is true', () => {
    render(<AlarmsList alarms={null as any} weatherChecked={true} />);
    expect(screen.getByText('There are no periods in the next day within your temperature preference.')).toBeTruthy();
  });

  it('does not show empty state when alarms is null and weatherChecked is false', () => {
    render(<AlarmsList alarms={null as any} weatherChecked={false} />);
    expect(screen.queryByText('There are no periods in the next day within your temperature preference.')).toBeFalsy();
  });

  it('shows empty state when alarms is undefined and weatherChecked is true', () => {
    render(<AlarmsList alarms={undefined as any} weatherChecked={true} />);
    expect(screen.getByText('There are no periods in the next day within your temperature preference.')).toBeTruthy();
  });

  it('does not show empty state when alarms is undefined and weatherChecked is false', () => {
    render(<AlarmsList alarms={undefined as any} weatherChecked={false} />);
    expect(screen.queryByText('There are no periods in the next day within your temperature preference.')).toBeFalsy();
  });

  it('renders single alarm correctly', () => {
    const singleAlarm = [mockAlarms[0]];
    render(<AlarmsList alarms={singleAlarm} />);

    expect(screen.getByTestId('alarms-list')).toBeTruthy();
    expect(screen.getByText('06:00 (Run)')).toBeTruthy();
    expect(screen.getByText('Wake: 05:30 | Bed: 22:30')).toBeTruthy();
    expect(screen.getByText('Optimal temperature for running')).toBeTruthy();
    
    // Should not show the second alarm
    expect(screen.queryByText('07:00 (Run)')).toBeFalsy();
  });

  it('handles alarms with missing optional fields', () => {
    const incompleteAlarm: RunSchedule[] = [
      {
        optimalRunTime: '06:00',
        wakeTime: '05:30',
        bedTime: '22:30',
        reason: '',
      },
    ];

    render(<AlarmsList alarms={incompleteAlarm} />);

    expect(screen.getByText('06:00 (Run)')).toBeTruthy();
    expect(screen.getByText('Wake: 05:30 | Bed: 22:30')).toBeTruthy();
    // Empty reason should still render (empty string)
    expect(screen.getByText('')).toBeTruthy();
  });
}); 