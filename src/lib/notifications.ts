import { supabase } from './supabase';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  // Get push subscription
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
    ).buffer as ArrayBuffer,
    userVisibleOnly: true,
  });

  // Store subscription in Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      subscription: JSON.stringify(subscription),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  return true;
}

export async function unsubscribeFromPush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
  }
}

export function showLocalNotification(title: string, body: string): void {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/favicon.svg',
        tag: 'velqora-notification',
      });
    });
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
