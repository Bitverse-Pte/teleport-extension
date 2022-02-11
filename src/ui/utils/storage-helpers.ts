import localforage from 'localforage';

export async function getStorageItem(key: string) {
  try {
    const serializedData = await localforage.getItem<string>(key);
    if (serializedData === null) {
      return undefined;
    }

    return JSON.parse(serializedData as string);
  } catch (err) {
    return undefined;
  }
}

export async function setStorageItem<T = any>(key: string, value: T) {
  try {
    const serializedData = JSON.stringify(value);
    await localforage.setItem(key, serializedData);
  } catch (err) {
    console.warn(err);
  }
}
