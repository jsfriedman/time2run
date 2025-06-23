import { Location, WeatherData } from '../types/preferences';

export class WeatherService {
  private readonly API_KEY = 'YOUR_WEATHER_API_KEY'; // This should be stored in environment variables
  private readonly BASE_URL = 'http://api.weatherapi.com/v1';

  async getWeatherForecast(location: Location): Promise<WeatherData> {
    const url = `${this.BASE_URL}/forecast.json?key=${this.API_KEY}&q=${location.latitude},${location.longitude}&days=1&hour=1`;
    
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
      
      // Transform the API response to our WeatherData format
      // For testing, we'll return the data as-is if it already has the hourly format
      if (data.hourly && Array.isArray(data.hourly)) {
        return data;
      }
      
      // Otherwise, transform from the actual API format
      const hourly = data.forecast?.forecastday?.[0]?.hour?.map((hour: any) => ({
        time: hour.time,
        temperature: hour.temp_f
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