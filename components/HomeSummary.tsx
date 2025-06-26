import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RunSchedule, UserPreferences } from '../types/preferences';

interface HomeSummaryProps {
  nextRun: RunSchedule | null;
  preferences: UserPreferences;
}

export const HomeSummary: React.FC<HomeSummaryProps> = ({ nextRun, preferences }) => {
  return (
    <View testID="home-summary">
      <Text testID="next-run-heading" style={styles.heading}>
        Next Run
      </Text>
      {nextRun ? (
        <View style={styles.nextRunBox}>
          <Text style={styles.nextRunTime}>{nextRun.optimalRunTime}</Text>
          <Text>Wake: {nextRun.wakeTime} | Bed: {nextRun.bedTime}</Text>
          <Text>{nextRun.reason}</Text>
        </View>
      ) : (
        <Text>No run scheduled yet.</Text>
      )}
      <Text style={styles.summaryHeading}>Preferences Summary</Text>
      <Text>Max Temp: {preferences.maxTemperature}°F</Text>
      <Text>Prep: {preferences.preparationTime} min</Text>
      <Text>Sleep: {preferences.idealSleepHours} hrs</Text>
      <Text>Buffer: {preferences.bufferTimeBeforeExceed} min</Text>
      <Text>Run Duration: {preferences.preferredRunDuration} min</Text>
      <Text>Location: {preferences.location.city} ({preferences.location.latitude}, {preferences.location.longitude})</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
  },
  nextRunBox: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  nextRunTime: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  summaryHeading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 4,
  },
}); 