import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AlarmsList } from '../../components/AlarmsList';
import { PreferencesContext } from '../../components/PreferencesContext';
import { WeatherService } from '../../services/weatherService';

export default function AlarmsScreen() {
  const ctx = React.useContext(PreferencesContext);
  const [lowestTemp, setLowestTemp] = React.useState<number | null>(null);
  const [weatherChecked, setWeatherChecked] = React.useState(false);

  React.useEffect(() => {
    async function fetchLowestTemp() {
      if (!ctx) return;
      const weatherService = new WeatherService();
      try {
        const weather = await weatherService.getWeatherForecast(ctx.preferences.location);
        const temps = weather.hourly.map(h => h.temperature);
        setLowestTemp(Math.min(...temps));
      } catch {
        setLowestTemp(null);
      }
      setWeatherChecked(true);
    }
    if (ctx && ctx.alarms.length === 0) {
      fetchLowestTemp();
    }
  }, [ctx && ctx.alarms.length, ctx && ctx.preferences.location]);

  if (!ctx) return null;
  const { alarms, loading } = ctx;

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator testID="loading-indicator" /></View>;
  }

  return <AlarmsList alarms={alarms} lowestTemp={lowestTemp} weatherChecked={weatherChecked} />;
} 