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