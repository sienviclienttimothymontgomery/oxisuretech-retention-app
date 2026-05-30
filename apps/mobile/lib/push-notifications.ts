import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabase';

let listenersRegistered = false;

export async function setupPushNotifications(userId: string) {
  try {
    console.log('[Push] Mocking push setup for testing to prevent native crash.');
    
    // 1. Mock permission check
    // let permStatus = await PushNotifications.checkPermissions();
    // if (permStatus.receive === 'prompt') {
    //   permStatus = await PushNotifications.requestPermissions();
    // }
    // if (permStatus.receive !== 'granted') { return false; }

    // 2. Mock register
    // await PushNotifications.register();

    // 3. Mock saving a fake token
    if (!listenersRegistered) {
      listenersRegistered = true;
      const fakeToken = 'test-token-12345';
      const { error } = await supabase.from('profiles').update({ push_token: fakeToken }).eq('id', userId);
      if (error) console.error('[Push] Failed to save mock token:', error);
      else console.log('[Push] Mock token saved to DB');
    }

    return true;
  } catch (error) {
    console.error('[Push] Setup failed:', error);
    return false;
  }
}
