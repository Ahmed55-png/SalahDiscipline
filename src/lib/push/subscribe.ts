/**
 * Helper used by client components to convert a base64url VAPID public
 * key (as exposed via NEXT_PUBLIC_VAPID_PUBLIC_KEY) into the Uint8Array
 * format that PushManager.subscribe() wants.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = atob(base64)
  const out = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    out[i] = rawData.charCodeAt(i)
  }
  return out
}
