import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useWorkoutReminderNotification() {
  useEffect(() => {
    let mounted = true;

    const setupNotification = async () => {
      try {
        // ---------------------------------------------------------
        // Android notification channel
        // ---------------------------------------------------------
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(
            'daily-reminder',
            {
              name: 'Daily Reminders',
              importance:
                Notifications.AndroidImportance.HIGH,
              vibrationPattern: [0, 250, 250, 250],
              sound: 'default',
            },
          );
        }

        // ---------------------------------------------------------
        // Check notification permission
        // ---------------------------------------------------------
        const currentPermissions =
          await Notifications.getPermissionsAsync();

        let permissionStatus =
          currentPermissions.status;

        // Request permission if necessary
        if (permissionStatus !== 'granted') {
          const requestedPermissions =
            await Notifications.requestPermissionsAsync();

          permissionStatus =
            requestedPermissions.status;
        }

        // Permission denied
        if (
          permissionStatus !== 'granted' ||
          !mounted
        ) {
          return;
        }

        // ---------------------------------------------------------
        // Wait 10 seconds after app launch
        // ---------------------------------------------------------
        await new Promise<void>(resolve => {
          setTimeout(resolve, 10000);
        });

        if (!mounted) {
          return;
        }

        // ---------------------------------------------------------
        // Send notification
        // ---------------------------------------------------------
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Neurolia',

            body:
              "You haven't completed today's workout yet. Don't forget to take care of your body!",

            sound: 'default',

            data: {
              type: 'workout-reminder',
              source: 'app-launch',
            },
          },

          trigger: null,
        });
      } catch (error) {
        console.warn(
          'Neurolia workout notification error:',
          error,
        );
      }
    };

    setupNotification();

    return () => {
      mounted = false;
    };
  }, []);
}

export default useWorkoutReminderNotification;