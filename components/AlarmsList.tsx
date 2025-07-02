import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RunSchedule } from '../types/preferences';

export interface AlarmsListProps {
  alarms: RunSchedule[];
  lowestTemp?: number | null;
  weatherChecked?: boolean;
}

export const AlarmsList: React.FC<AlarmsListProps> = ({ alarms, lowestTemp, weatherChecked }) => {
  const safeAlarms = Array.isArray(alarms) ? alarms : [];
  if (safeAlarms.length === 0) {
    if (weatherChecked) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888', marginBottom: 8 }}>
            There are no periods in the next day within your temperature preference.
          </Text>
          {typeof lowestTemp === 'number' && (
            <Text style={{ color: '#888' }}>
              Tomorrow's lowest temperature will be: {lowestTemp}°F
            </Text>
          )}
        </View>
      );
    }
    return null;
  }

  return (
    <View testID="alarms-list">
      <Text testID="alarms-heading" style={styles.heading}>
        Alarms
      </Text>
      <FlatList
        data={safeAlarms}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.item} data-testid="alarm-item">
            <Text style={styles.time}>{item.optimalRunTime} (Run)</Text>
            <Text>Wake: {item.wakeTime} | Bed: {item.bedTime}</Text>
            <Text>{item.reason}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  item: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  time: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: '#888',
  },
}); 