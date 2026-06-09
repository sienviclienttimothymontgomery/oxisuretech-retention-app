import { createClient } from './supabase/client';

const UTM_COOKIE_NAME = 'oxisure_utm_params';

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
};

// ── Cookie Helpers ───────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const val = parts.pop()?.split(';').shift();
    return val ? decodeURIComponent(val) : null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax; Secure`;
}

// ── UTM Extraction & Persistence ─────────────────────────────────────────────

/**
 * Extracts UTM parameters from URLSearchParams and saves them to a cookie.
 * Also captures the document referrer if it is external.
 */
export function captureAttribution(searchParams: URLSearchParams): void {
  if (typeof window === 'undefined') return;

  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmContent = searchParams.get('utm_content');
  const utmTerm = searchParams.get('utm_term');

  // We only write to the cookie if we actually find new UTM parameters in the URL
  if (utmSource || utmMedium || utmCampaign || utmContent || utmTerm) {
    const params: UtmParams = {
      ...(utmSource && { utm_source: utmSource }),
      ...(utmMedium && { utm_medium: utmMedium }),
      ...(utmCampaign && { utm_campaign: utmCampaign }),
      ...(utmContent && { utm_content: utmContent }),
      ...(utmTerm && { utm_term: utmTerm }),
    };

    // Capture referrer if it exists and is not our own domain
    const ref = document.referrer;
    if (ref && !ref.includes(window.location.hostname)) {
      params.referrer = ref;
    }

    setCookie(UTM_COOKIE_NAME, JSON.stringify(params), 30); // Persist for 30 days
    console.log('[Analytics] Captured UTM parameters:', params);
  } else {
    // If no UTMs in URL, but we have an external referrer and no existing cookie, save just the referrer
    const existingCookie = getCookie(UTM_COOKIE_NAME);
    const ref = document.referrer;
    if (!existingCookie && ref && !ref.includes(window.location.hostname)) {
      const params: UtmParams = { referrer: ref };
      setCookie(UTM_COOKIE_NAME, JSON.stringify(params), 30);
      console.log('[Analytics] Captured referrer only:', params);
    }
  }
}

/**
 * Retrieves the stored UTM parameters from the cookie.
 */
export function getStoredAttribution(): UtmParams {
  const cookieVal = getCookie(UTM_COOKIE_NAME);
  if (!cookieVal) return {};
  try {
    return JSON.parse(cookieVal) as UtmParams;
  } catch (e) {
    console.error('[Analytics] Error parsing UTM cookie:', e);
    return {};
  }
}

// ── Device & Client Info ─────────────────────────────────────────────────────

function getDeviceInfo() {
  if (typeof window === 'undefined') return {};
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    platform: (navigator as any).userAgentData?.platform || navigator.platform,
  };
}

// ── Log Event to Database ────────────────────────────────────────────────────

/**
 * Logs an analytics event to Supabase.
 * Pulls stored UTM parameters from cookies and client device details automatically.
 */
export async function logEvent(
  eventName: string,
  userId?: string,
  customData?: Record<string, any>
): Promise<void> {
  try {
    const supabase = createClient();
    const utm = getStoredAttribution();
    const deviceInfo = getDeviceInfo();

    // If no explicit userId is provided, attempt to retrieve the active user session
    let activeUserId = userId;
    if (!activeUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      activeUserId = session?.user?.id;
    }

    const eventPayload = {
      user_id: activeUserId || null,
      event_name: eventName,
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      utm_content: utm.utm_content || null,
      utm_term: utm.utm_term || null,
      referrer: utm.referrer || null,
      device_info: {
        ...deviceInfo,
        ...customData,
      },
    };

    const { error } = await supabase
      .from('analytics_events')
      .insert(eventPayload);

    if (error) throw error;

    console.log(`[Analytics] Successfully logged event: "${eventName}"`, eventPayload);
  } catch (err: any) {
    // Fail silently so analytics doesn't crash user flows
    console.warn('[Analytics] Failed to log event:', err?.message || err);
  }
}
