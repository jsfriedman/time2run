import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PreferencesProvider } from '../../components/PreferencesContext';

export default function TabLayout() {
  return (
    <PreferencesProvider>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'index') {
              return <Ionicons name="home" size={size} color={color} />;
            }
            if (route.name === 'alarms') {
              return <Ionicons name="alarm" size={size} color={color} />;
            }
            if (route.name === 'preferences') {
              return <Ionicons name="settings" size={size} color={color} />;
            }
            return null;
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="alarms"
          options={{
            title: 'Alarms',
          }}
        />
        <Tabs.Screen
          name="preferences"
          options={{
            title: 'Preferences',
          }}
        />
      </Tabs>
    </PreferencesProvider>
  );
} 