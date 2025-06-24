import { Location, WeatherData } from '../types/preferences';

export class WeatherService {
  private readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  async getWeatherForecast(location: Location): Promise<WeatherData> {
    // Open-Meteo API parameters for 1-day forecast with hourly temperature data
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      hourly: 'temperature_2m',
      forecast_days: '1',
      temperature_unit: 'fahrenheit', // Use Fahrenheit for consistency
      timezone: 'auto'
    });

    const url = `${this.BASE_URL}?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform Open-Meteo API response to our WeatherData format
      const hourly = data.hourly?.time?.map((time: string, index: number) => ({
        time: time,
        temperature: data.hourly.temperature_2m[index]
      })) || [];

      return { hourly };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching weather data');
    }
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: 'Unknown' // Could be enhanced with reverse geocoding
          });
        },
        (error) => {
          reject(new Error(error.message));
        }
      );
    });
  }
} 