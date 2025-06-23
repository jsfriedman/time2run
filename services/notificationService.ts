import * as Notifications from 'expo-notifications';
import { RunSchedule } from '../types/preferences';

export class NotificationService {
  async scheduleRunReminder(schedule: RunSchedule): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time2Run - Tomorrow\'s Schedule',
        body: `Bed time: ${schedule.bedTime} | Wake up: ${schedule.wakeTime} | Run time: ${schedule.optimalRunTime}`,
        data: { schedule }
      },
      trigger: {
        hour: 15, // 3 PM
        minute: 0,
        repeats: false
      } as any
    });

    return notificationId;
  }

  async scheduleWakeUpAlarm(schedule: RunSchedule): Promise<string> {
    const { hours: wakeHour, minutes: wakeMinute } = this.parseTime(schedule.wakeTime);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time2Run - Wake Up!',
        body: `Time for your run! Optimal temperature window starts at ${schedule.optimalRunTime}`,
        data: { schedule }
      },
      trigger: {
        hour: wakeHour,
        minute: wakeMinute,
        repeats: false
      } as any
    });

    return notificationId;
  }

  async cancelAllNotifications(): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  private parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }
} 