const STORAGE_KEYS = {
  ACCESS_TOKEN: "grit.accessToken",
} as const;

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function getAccessToken() {
  return getStorage()?.getItem(STORAGE_KEYS.ACCESS_TOKEN) ?? null;
}

export function setAccessToken(accessToken: string) {
  getStorage()?.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
}

export function removeAccessToken() {
  getStorage()?.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
}
