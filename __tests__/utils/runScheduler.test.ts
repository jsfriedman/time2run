import { UserPreferences, DEFAULT_PREFERENCES } from '../../types/preferences';
import { RunScheduler } from '../../utils/runScheduler';

describe('RunScheduler', () => {
  let scheduler: RunScheduler;
  let mockPreferences: UserPreferences;

  beforeEach(() => {
    mockPreferences = {
      maxTemperature: 75,
      preparationTime: 15, // minutes
      idealSleepHours: 8,
      preferredRunDuration: 30, // minutes
      bufferTimeBeforeExceed: 90, // 1.5 hours
      preferredDefaultTime: '07:00', // new field
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York'
      }
    };
    scheduler = new RunScheduler();
  });

  describe('calculateOptimalRunTime', () => {
    it('should calculate optimal run time when weather is below max temperature', () => {
      const weatherData = {
        hourly: [
          { time: '2024-06-15T06:00:00', temperature: 65 },
          { time: '2024-06-15T07:00:00', temperature: 68 },
          { time: '2024-06-15T08:00:00', temperature: 72 },
          { time: '2024-06-15T09:00:00', temperature: 78 },
          { time: '2024-06-15T10:00:00', temperature: 82 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, mockPreferences);
      
      // Temperature exceeds at 09:00, so optimal run time should be 07:30 (90 min before)
      expect(result?.optimalRunTime).toBe('07:30');
      expect(result?.bedTime).toBe('23:15'); // 8 hours before 07:15
      expect(result?.wakeTime).toBe('07:15'); // 15 min before 07:30
      expect(result?.reason).toBe('Weather will exceed 75°F by 09:00');
    });

    it('should schedule at preferred default time when all temperatures are below max', () => {
      const weatherData = {
        hourly: [
          { time: '2024-06-15T06:00:00', temperature: 65 },
          { time: '2024-06-15T07:00:00', temperature: 68 },
          { time: '2024-06-15T08:00:00', temperature: 72 },
          { time: '2024-06-15T09:00:00', temperature: 70 },
          { time: '2024-06-15T10:00:00', temperature: 73 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, mockPreferences);
      
      // All temps below 75°F, should schedule at preferred default time (07:00)
      expect(result?.optimalRunTime).toBe('07:00');
      expect(result?.wakeTime).toBe('06:45'); // 15 min before 07:00
      expect(result?.bedTime).toBe('22:45'); // 8 hours before 06:45
      expect(result?.reason).toBe('All temperatures below 75°F, using preferred time 07:00');
    });

    it('should schedule at preferred default time when max temperature is very high', () => {
      const highTempPreferences = {
        ...mockPreferences,
        maxTemperature: 95
      };

      const weatherData = {
        hourly: [
          { time: '2024-06-15T06:00:00', temperature: 65 },
          { time: '2024-06-15T07:00:00', temperature: 68 },
          { time: '2024-06-15T08:00:00', temperature: 72 },
          { time: '2024-06-15T09:00:00', temperature: 74 },
          { time: '2024-06-15T10:00:00', temperature: 78 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, highTempPreferences);
      
      // All temps below 95°F, should schedule at preferred default time
      expect(result?.optimalRunTime).toBe('07:00');
      expect(result?.reason).toBe('All temperatures below 95°F, using preferred time 07:00');
    });

    it('should handle different preferred default times', () => {
      const earlyBirdPreferences = {
        ...mockPreferences,
        preferredDefaultTime: '06:00'
      };

      const weatherData = {
        hourly: [
          { time: '2024-06-15T06:00:00', temperature: 65 },
          { time: '2024-06-15T07:00:00', temperature: 68 },
          { time: '2024-06-15T08:00:00', temperature: 72 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, earlyBirdPreferences);
      
      expect(result?.optimalRunTime).toBe('06:00');
      expect(result?.wakeTime).toBe('05:45'); // 15 min before 06:00
      expect(result?.reason).toBe('All temperatures below 75°F, using preferred time 06:00');
    });

    it('should respect minimum wake time even with early preferred time', () => {
      const earlyBirdPreferences = {
        ...mockPreferences,
        preferredDefaultTime: '04:00', // Very early
        preparationTime: 30
      };

      const weatherData = {
        hourly: [
          { time: '2024-06-15T06:00:00', temperature: 65 },
          { time: '2024-06-15T07:00:00', temperature: 68 },
          { time: '2024-06-15T08:00:00', temperature: 72 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, earlyBirdPreferences);
      
      // Should adjust to minimum wake time (5:00 AM)
      expect(result?.optimalRunTime).toBe('05:30'); // 30 min after 05:00 wake time
      expect(result?.wakeTime).toBe('05:00'); // Minimum wake time
      expect(result?.reason).toBe('All temperatures below 75°F, adjusted to minimum wake time');
    });

    it('should return null when no suitable time is found due to temperature constraints', () => {
      const weatherData = {
        hourly: [
          { time: '2024-06-15T06:00:00', temperature: 80 },
          { time: '2024-06-15T07:00:00', temperature: 85 },
          { time: '2024-06-15T08:00:00', temperature: 90 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, mockPreferences);
      
      expect(result).toBeNull();
    });

    it('should handle different preparation times', () => {
      const preferencesWithLongPrep = {
        ...mockPreferences,
        preparationTime: 30
      };

      const weatherData = {
        hourly: [
          { time: '2024-06-15T06:00:00', temperature: 65 },
          { time: '2024-06-15T07:00:00', temperature: 68 },
          { time: '2024-06-15T08:00:00', temperature: 72 },
          { time: '2024-06-15T09:00:00', temperature: 78 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, preferencesWithLongPrep);
      
      // Temperature exceeds at 09:00, optimal run time 07:30, wake time 07:00 (30 min before)
      expect(result?.wakeTime).toBe('07:00');
      expect(result?.optimalRunTime).toBe('07:30');
    });

    it('should respect minimum wake time (5:00 AM)', () => {
      const preferences = {
        ...mockPreferences,
        preparationTime: 60
      };

      const weatherData = {
        hourly: [
          { time: '2024-06-15T04:00:00', temperature: 65 },
          { time: '2024-06-15T05:00:00', temperature: 68 },
          { time: '2024-06-15T06:00:00', temperature: 72 },
          { time: '2024-06-15T07:00:00', temperature: 78 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, preferences);
      
      // Temperature exceeds at 07:00, optimal run time 05:30, wake time 05:00 (60 min before)
      expect(result?.wakeTime).toBe('05:00');
      expect(result?.optimalRunTime).toBe('05:30');
    });

    it('should handle configurable buffer time', () => {
      const preferencesWithCustomBuffer = {
        ...mockPreferences,
        bufferTimeBeforeExceed: 60 // 1 hour instead of 1.5 hours
      };

      const weatherData = {
        hourly: [
          { time: '2024-06-15T06:00:00', temperature: 65 },
          { time: '2024-06-15T07:00:00', temperature: 68 },
          { time: '2024-06-15T08:00:00', temperature: 72 },
          { time: '2024-06-15T09:00:00', temperature: 78 }
        ]
      };

      const result = scheduler.calculateOptimalRunTime(weatherData, preferencesWithCustomBuffer);
      
      // Temperature exceeds at 09:00, optimal run time 08:00 (60 min before)
      expect(result?.optimalRunTime).toBe('08:00');
      expect(result?.wakeTime).toBe('07:45'); // 15 min before 08:00
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(scheduler.formatTime(5, 30)).toBe('05:30');
      expect(scheduler.formatTime(14, 5)).toBe('14:05');
      expect(scheduler.formatTime(0, 0)).toBe('00:00');
    });
  });

  describe('parseTime', () => {
    it('should parse time string correctly', () => {
      expect(scheduler.parseTime('05:30')).toEqual({ hours: 5, minutes: 30 });
      expect(scheduler.parseTime('14:05')).toEqual({ hours: 14, minutes: 5 });
      expect(scheduler.parseTime('00:00')).toEqual({ hours: 0, minutes: 0 });
    });
  });
}); 