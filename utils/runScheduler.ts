import { UserPreferences, RunSchedule, WeatherData, DEFAULT_PREFERENCES } from '../types/preferences';

export class RunScheduler {
  private readonly MIN_WAKE_TIME = 5; // 5:00 AM minimum

  calculateOptimalRunTime(weatherData: WeatherData, preferences: UserPreferences): RunSchedule | null {
    // Merge with defaults to ensure all required fields are present
    const prefs = { ...DEFAULT_PREFERENCES, ...preferences };
    const { maxTemperature, preparationTime, idealSleepHours, bufferTimeBeforeExceed, preferredDefaultTime } = prefs;

    // Find the first hour where temperature exceeds max
    let temperatureExceedsTime: string | null = null;
    for (const hour of weatherData.hourly) {
      if (hour.temperature > maxTemperature) {
        temperatureExceedsTime = hour.time;
        break;
      }
    }

    // If all temperatures are below max, schedule at preferred default time
    if (!temperatureExceedsTime) {
      return this.calculateScheduleAtPreferredTime(prefs, preferredDefaultTime, maxTemperature);
    }

    // Parse the time when temperature exceeds max
    const exceedDate = new Date(temperatureExceedsTime);
    const exceedHour = exceedDate.getHours();
    const exceedMinute = exceedDate.getMinutes();

    // Calculate optimal run time (bufferTimeBeforeExceed minutes before exceed time)
    let optimalRunMinutes = exceedHour * 60 + exceedMinute - bufferTimeBeforeExceed;
    if (optimalRunMinutes < 0) optimalRunMinutes += 24 * 60;
    let optimalRunHour = Math.floor(optimalRunMinutes / 60);
    let optimalRunMinute = optimalRunMinutes % 60;
    
    // Check if optimal run time is too early
    if (optimalRunHour < this.MIN_WAKE_TIME) {
      return null;
    }
    
    const optimalRunTime = this.formatTime(optimalRunHour, optimalRunMinute);

    // Calculate wake time (preparationTime before optimal run time)
    let wakeMinutes = optimalRunHour * 60 + optimalRunMinute - preparationTime;
    if (wakeMinutes < 0) wakeMinutes += 24 * 60;
    let wakeHour = Math.floor(wakeMinutes / 60);
    let wakeMinute = wakeMinutes % 60;
    
    // Ensure wake time is not before minimum
    if (wakeHour < this.MIN_WAKE_TIME) {
      wakeHour = this.MIN_WAKE_TIME;
      wakeMinute = 0;
    }
    
    const wakeTime = this.formatTime(wakeHour, wakeMinute);

    // Calculate bed time (idealSleepHours before wake time)
    let bedMinutes = wakeHour * 60 + wakeMinute - idealSleepHours * 60;
    if (bedMinutes < 0) bedMinutes += 24 * 60;
    let bedHour = Math.floor(bedMinutes / 60);
    let bedMinute = bedMinutes % 60;
    const bedTime = this.formatTime(bedHour, bedMinute);

    return {
      optimalRunTime,
      bedTime,
      wakeTime,
      reason: `Weather will exceed ${maxTemperature}°F by ${this.formatTime(exceedHour, exceedMinute)}`
    };
  }

  private calculateScheduleAtPreferredTime(prefs: UserPreferences, preferredTime: string, maxTemperature: number): RunSchedule {
    const { preparationTime, idealSleepHours } = prefs;
    
    // Parse preferred time
    const { hours: preferredHour, minutes: preferredMinute } = this.parseTime(preferredTime);
    
    // Check if preferred time would result in wake time before minimum
    let wakeMinutes = preferredHour * 60 + preferredMinute - preparationTime;
    if (wakeMinutes < 0) wakeMinutes += 24 * 60;
    let wakeHour = Math.floor(wakeMinutes / 60);
    let wakeMinute = wakeMinutes % 60;
    
    let optimalRunTime = preferredTime;
    let reason = `All temperatures below ${maxTemperature}°F, using preferred time ${preferredTime}`;
    
    // If wake time would be before minimum, adjust to minimum wake time
    if (wakeHour < this.MIN_WAKE_TIME) {
      wakeHour = this.MIN_WAKE_TIME;
      wakeMinute = 0;
      optimalRunTime = this.formatTime(wakeHour + Math.floor(preparationTime / 60), preparationTime % 60);
      reason = `All temperatures below ${maxTemperature}°F, adjusted to minimum wake time`;
    }
    
    const wakeTime = this.formatTime(wakeHour, wakeMinute);

    // Calculate bed time (idealSleepHours before wake time)
    let bedMinutes = wakeHour * 60 + wakeMinute - idealSleepHours * 60;
    if (bedMinutes < 0) bedMinutes += 24 * 60;
    let bedHour = Math.floor(bedMinutes / 60);
    let bedMinute = bedMinutes % 60;
    const bedTime = this.formatTime(bedHour, bedMinute);

    return {
      optimalRunTime,
      bedTime,
      wakeTime,
      reason
    };
  }

  private calculateDefaultSchedule(preferences: UserPreferences): RunSchedule {
    const prefs = { ...DEFAULT_PREFERENCES, ...preferences };
    const { preparationTime, idealSleepHours } = prefs;
    
    // Default to 7:00 AM run
    const optimalRunTime = '07:00';
    const wakeTime = this.subtractMinutes(optimalRunTime, preparationTime);
    const bedTime = this.subtractHours(wakeTime, idealSleepHours);
    
    return {
      optimalRunTime,
      bedTime,
      wakeTime,
      reason: 'No temperature constraints found, using default schedule'
    };
  }

  formatTime(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  private subtractMinutes(timeString: string, minutes: number): string {
    const { hours, minutes: currentMinutes } = this.parseTime(timeString);
    let totalMinutes = hours * 60 + currentMinutes - minutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    let newHours = Math.floor(totalMinutes / 60);
    let newMinutes = totalMinutes % 60;
    return this.formatTime(newHours, newMinutes);
  }

  private subtractHours(timeString: string, hours: number): string {
    const { hours: currentHours, minutes } = this.parseTime(timeString);
    let newHours = currentHours - hours;
    if (newHours < 0) newHours += 24;
    return this.formatTime(newHours, minutes);
  }
} 