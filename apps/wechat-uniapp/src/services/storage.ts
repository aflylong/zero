const STORAGE_KEY = "self-improvement-miniapp:v1";

export function readAppStorage<T>(fallback: T) {
  try {
    const value = uni.getStorageSync(STORAGE_KEY);
    return value ? (value as T) : fallback;
  } catch (error) {
    console.error("read app storage failed", error);
    return fallback;
  }
}

export function writeAppStorage<T>(value: T) {
  try {
    uni.setStorageSync(STORAGE_KEY, value);
  } catch (error) {
    console.error("write app storage failed", error);
  }
}
