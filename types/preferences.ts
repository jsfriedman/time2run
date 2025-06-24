export interface Location {
  latitude: number;
  longitude: number;
  city: string;
}

export interface UserPreferences {
  maxTemperature: number; // Fahrenheit
  preparationTime: number; // minutes
  idealSleepHours: number;
  preferredRunDuration: number; // minutes
  bufferTimeBeforeExceed: number; // minutes before temperature exceeds max
  location: Location;
}

export interface RunSchedule {
  optimalRunTime: string; // HH:MM format
  bedTime: string; // HH:MM format
  wakeTime: string; // HH:MM format
  reason: string;
}

export interface WeatherData {
  hourly: Array<{
    time: string;
    temperature: number;
  }>;
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  maxTemperature: 75,
  preparationTime: 15,
  idealSleepHours: 8,
  preferredRunDuration: 30,
  bufferTimeBeforeExceed: 90, // 1.5 hours default
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York'
  }
}; 