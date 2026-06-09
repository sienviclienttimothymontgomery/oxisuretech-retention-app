import { cookies } from 'next/headers';
import { createClient } from './supabase/server';

export async function logServerEvent(
  eventName: string,
  userId?: string,
  customData?: Record<string, any>
): Promise<void> {
  try {
    const supabase = await createClient();

    let activeUserId = userId;
    if (!activeUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      activeUserId = user?.id;
    }

    const cookieStore = await cookies();
    const utmCookie = cookieStore.get('oxisure_utm_params')?.value;
    let utm: any = {};
    if (utmCookie) {
      try {
        utm = JSON.parse(decodeURIComponent(utmCookie));
      } catch (e) {
        console.error('[Analytics Server] Error parsing UTM cookie:', e);
      }
    }

    const payload = {
      user_id: activeUserId || null,
      event_name: eventName,
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      utm_content: utm.utm_content || null,
      utm_term: utm.utm_term || null,
      referrer: utm.referrer || null,
      device_info: {
        server_logged: true,
        ...customData,
      },
    };

    const { error } = await supabase
      .from('analytics_events')
      .insert(payload);

    if (error) throw error;

    console.log(`[Analytics Server] Successfully logged event: "${eventName}"`, payload);
  } catch (err: any) {
    // Fail silently so it doesn't crash user flows
    console.warn('[Analytics Server] Failed to log event:', err?.message || err);
  }
}
