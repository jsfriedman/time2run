import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, DEFAULT_PREFERENCES, RunSchedule } from '../types/preferences';
import { RunScheduler } from '../utils/runScheduler';
import { WeatherService } from '../services/weatherService';

interface PreferencesContextType {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  alarms: RunSchedule[];
  refreshAlarms: () => Promise<void>;
  loading: boolean;
}

export const PreferencesContext = React.createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferencesState] = React.useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [alarms, setAlarms] = React.useState<RunSchedule[]>([]);
  const [loading, setLoading] = React.useState(true);

  const scheduler = React.useRef(new RunScheduler()).current;
  const weatherService = React.useRef(new WeatherService()).current;

  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('userPreferences');
      if (stored) {
        setPreferencesState(JSON.parse(stored));
      }
      setLoading(false);
    })();
  }, []);

  React.useEffect(() => {
    refreshAlarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  const setPreferences = (prefs: UserPreferences) => {
    setPreferencesState(prefs);
    AsyncStorage.setItem('userPreferences', JSON.stringify(prefs));
  };

  const refreshAlarms = async () => {
    setLoading(true);
    try {
      const weather = await weatherService.getWeatherForecast(preferences.location);
      const run = scheduler.calculateOptimalRunTime(weather, preferences);
      setAlarms(run ? [run] : []);
    } catch (e) {
      setAlarms([]);
    }
    setLoading(false);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, alarms, refreshAlarms, loading }}>
      {children}
    </PreferencesContext.Provider>
  );
}; 