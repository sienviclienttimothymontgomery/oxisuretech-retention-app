import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabase';

let listenersRegistered = false;

export async function setupPushNotifications(userId: string) {
  try {
    // 1. Request permission
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] User denied push notifications');
      return false;
    }

    // 2. Register to receive tokens
    await PushNotifications.register();

    // 3. Listeners — only register once to prevent duplicate handlers on re-login
    if (!listenersRegistered) {
      listenersRegistered = true;

      PushNotifications.addListener('registration', async (token) => {
        console.log('[Push] Registration success, token:', token.value);
        
        // Save the token to the user's Supabase profile
        const { error } = await supabase
          .from('profiles')
          .update({ push_token: token.value })
          .eq('id', userId);
          
        if (error) {
          console.error('[Push] Failed to save token to DB:', error);
        } else {
          console.log('[Push] Token successfully saved to DB');
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('[Push] Error on registration:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Push] Received notification:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('[Push] Action performed:', notification);
      });
    }

    return true;
  } catch (error) {
    console.error('[Push] Setup failed:', error);
    return false;
  }
}
