import * as React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RunSchedule } from '../types/preferences';

interface AlarmsListProps {
  alarms: RunSchedule[];
}

export const AlarmsList: React.FC<AlarmsListProps> = ({ alarms }) => {
  if (!alarms || alarms.length === 0) {
    return <Text style={styles.empty}>No upcoming alarms scheduled.</Text>;
  }
  return (
    <View testID="alarms-list">
      <Text testID="alarms-heading" style={styles.heading}>
        Alarms
      </Text>
      <FlatList
        data={alarms}
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