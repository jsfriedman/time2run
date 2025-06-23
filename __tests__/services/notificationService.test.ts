import { NotificationService } from '../../services/notificationService';
import { RunSchedule } from '../../types/preferences';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockSchedule: RunSchedule;

  beforeEach(() => {
    notificationService = new NotificationService();
    mockSchedule = {
      optimalRunTime: '07:30',
      bedTime: '23:30',
      wakeTime: '07:15',
      reason: 'Weather will exceed 75°F by 09:00'
    };
  });

  describe('scheduleRunReminder', () => {
    it('should schedule a run reminder notification', async () => {
      const { scheduleNotificationAsync } = require('expo-notifications');
      scheduleNotificationAsync.mockResolvedValueOnce('notification-id');

      const result = await notificationService.scheduleRunReminder(mockSchedule);

      expect(scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Time2Run - Tomorrow\'s Schedule',
          body: `Bed time: ${mockSchedule.bedTime} | Wake up: ${mockSchedule.wakeTime} | Run time: ${mockSchedule.optimalRunTime}`,
          data: { schedule: mockSchedule }
        },
        trigger: {
          hour: 15, // 3 PM
          minute: 0,
          repeats: false
        }
      });
      expect(result).toBe('notification-id');
    });

    it('should handle notification scheduling errors', async () => {
      const { scheduleNotificationAsync } = require('expo-notifications');
      scheduleNotificationAsync.mockRejectedValueOnce(new Error('Permission denied'));

      await expect(notificationService.scheduleRunReminder(mockSchedule))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('scheduleWakeUpAlarm', () => {
    it('should schedule a wake up alarm', async () => {
      const { scheduleNotificationAsync } = require('expo-notifications');
      scheduleNotificationAsync.mockResolvedValueOnce('alarm-id');

      const result = await notificationService.scheduleWakeUpAlarm(mockSchedule);

      expect(scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Time2Run - Wake Up!',
          body: `Time for your run! Optimal temperature window starts at ${mockSchedule.optimalRunTime}`,
          data: { schedule: mockSchedule }
        },
        trigger: {
          hour: 7,
          minute: 15,
          repeats: false
        }
      });
      expect(result).toBe('alarm-id');
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      const { getAllScheduledNotificationsAsync, cancelScheduledNotificationAsync } = require('expo-notifications');
      getAllScheduledNotificationsAsync.mockResolvedValueOnce([
        { identifier: 'notification-1' },
        { identifier: 'notification-2' }
      ]);
      cancelScheduledNotificationAsync.mockResolvedValueOnce(undefined);

      await notificationService.cancelAllNotifications();

      expect(getAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
      expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-1');
      expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-2');
    });
  });

  describe('requestPermissions', () => {
    it('should request notification permissions', async () => {
      const { requestPermissionsAsync } = require('expo-notifications');
      requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });

      const result = await notificationService.requestPermissions();

      expect(requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      const { requestPermissionsAsync } = require('expo-notifications');
      requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

      const result = await notificationService.requestPermissions();

      expect(result).toBe(false);
    });
  });
}); 