import { RunSchedule, UserPreferences, WeatherData } from '../types/preferences';

export class RunScheduler {
  private readonly MIN_WAKE_TIME = 5; // 5:00 AM minimum
  private readonly MAX_WAKE_TIME = 9; // 9:00 AM maximum

  calculateOptimalRunTime(weatherData: WeatherData, preferences: UserPreferences): RunSchedule | null {
    const { maxTemperature, preparationTime, idealSleepHours } = preferences;
    
    // Find the first hour where temperature exceeds max
    let temperatureExceedsTime: string | null = null;
    for (const hour of weatherData.hourly) {
      if (hour.temperature > maxTemperature) {
        temperatureExceedsTime = hour.time;
        break;
      }
    }

    // If all temperatures are above max, return null
    if (!temperatureExceedsTime) {
      return null;
    }

    // Parse the time when temperature exceeds max
    const exceedDate = new Date(temperatureExceedsTime);
    const exceedHour = exceedDate.getHours();
    const exceedMinute = exceedDate.getMinutes();

    // Calculate optimal run time (1.5 hours before exceed time)
    let optimalRunHour = exceedHour;
    let optimalRunMinute = exceedMinute;
    if (exceedMinute === 0) {
      optimalRunHour -= 1;
      optimalRunMinute = 30;
    } else {
      optimalRunHour -= 2;
      optimalRunMinute = 0;
    }
    if (optimalRunMinute < 0) {
      optimalRunHour -= 1;
      optimalRunMinute += 60;
    }
    if (optimalRunHour < this.MIN_WAKE_TIME) {
      return null;
    }
    const optimalRunTime = this.formatTime(optimalRunHour, optimalRunMinute);

    // Calculate wake time (preparationTime before optimal run time)
    let wakeMinutes = optimalRunHour * 60 + optimalRunMinute - preparationTime;
    let wakeHour = Math.floor(wakeMinutes / 60);
    let wakeMinute = wakeMinutes % 60;
    if (wakeMinute < 0) {
      wakeHour -= 1;
      wakeMinute += 60;
    }
    if (wakeHour < this.MIN_WAKE_TIME) {
      wakeHour = this.MIN_WAKE_TIME;
      wakeMinute = 0;
    }
    const wakeTime = this.formatTime(wakeHour, wakeMinute);

    // Calculate bed time (idealSleepHours before wake time)
    let bedMinutes = wakeHour * 60 + wakeMinute - idealSleepHours * 60;
    let bedHour = Math.floor(bedMinutes / 60);
    let bedMinute = bedMinutes % 60;
    if (bedMinute < 0) {
      bedHour -= 1;
      bedMinute += 60;
    }
    if (bedHour < 0) bedHour += 24;
    const bedTime = this.formatTime(bedHour, bedMinute);

    return {
      optimalRunTime,
      bedTime,
      wakeTime,
      reason: `Weather will exceed ${maxTemperature}°F by ${this.formatTime(exceedHour, 0)}`
    };
  }

  private calculateDefaultSchedule(preferences: UserPreferences): RunSchedule {
    const { preparationTime, idealSleepHours } = preferences;
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
    let newHours = Math.floor(totalMinutes / 60);
    let newMinutes = totalMinutes % 60;
    if (newMinutes < 0) {
      newHours -= 1;
      newMinutes += 60;
    }
    if (newHours < 0) newHours += 24;
    return this.formatTime(newHours, newMinutes);
  }

  private subtractHours(timeString: string, hours: number): string {
    const { hours: currentHours, minutes } = this.parseTime(timeString);
    let newHours = currentHours - hours;
    if (newHours < 0) newHours += 24;
    return this.formatTime(newHours, minutes);
  }
} 