import { WeatherService } from '../../services/weatherService';
import { Location } from '../../types/preferences';

// Mock fetch globally
global.fetch = jest.fn();

describe('WeatherService', () => {
  let weatherService: WeatherService;
  let mockLocation: Location;

  beforeEach(() => {
    weatherService = new WeatherService();
    mockLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York'
    };
    (fetch as jest.Mock).mockClear();
  });

  describe('getWeatherForecast', () => {
    it('should fetch weather data successfully', async () => {
      const mockWeatherData = {
        latitude: 40.7128,
        longitude: -74.0060,
        hourly: {
          time: ['2024-06-15T06:00', '2024-06-15T07:00', '2024-06-15T08:00'],
          temperature_2m: [65, 68, 72]
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const result = await weatherService.getWeatherForecast(mockLocation);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.open-meteo.com/v1/forecast'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Check that the response is transformed correctly
      expect(result.hourly).toEqual([
        { time: '2024-06-15T06:00', temperature: 65 },
        { time: '2024-06-15T07:00', temperature: 68 },
        { time: '2024-06-15T08:00', temperature: 72 }
      ]);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(weatherService.getWeatherForecast(mockLocation))
        .rejects.toThrow('Failed to fetch weather data: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(weatherService.getWeatherForecast(mockLocation))
        .rejects.toThrow('Network error');
    });

    it('should include correct query parameters', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hourly: { time: [], temperature_2m: [] } })
      });

      await weatherService.getWeatherForecast(mockLocation);

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const url = callArgs[0];
      
      expect(url).toContain(`latitude=${mockLocation.latitude}`);
      expect(url).toContain(`longitude=${mockLocation.longitude}`);
      expect(url).toContain('hourly=temperature_2m');
      expect(url).toContain('forecast_days=1');
      expect(url).toContain('temperature_unit=fahrenheit');
      expect(url).toContain('timezone=auto');
    });
  });

  describe('getCurrentLocation', () => {
    it('should get current location successfully', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn().mockImplementation((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          });
        }),
        clearWatch: jest.fn(),
        watchPosition: jest.fn()
      };

      global.navigator = {
        ...global.navigator,
        geolocation: mockGeolocation as any
      };

      const result = await weatherService.getCurrentLocation();

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'Unknown'
      });
    });

    it('should handle geolocation errors', async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn().mockImplementation((success, error) => {
          error(new Error('Permission denied'));
        }),
        clearWatch: jest.fn(),
        watchPosition: jest.fn()
      };

      global.navigator = {
        ...global.navigator,
        geolocation: mockGeolocation as any
      };

      await expect(weatherService.getCurrentLocation())
        .rejects.toThrow('Permission denied');
    });
  });
}); 