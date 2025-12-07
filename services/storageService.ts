import { ClothingItem, Outfit, UserProfile } from '../types';

const DB_NAME = 'StyleMateDB';
const DB_VERSION = 2; // Incremented for new stores
const STORE_ITEMS = 'items';
const STORE_OUTFITS = 'outfits';
const STORE_PROFILE = 'profile';

// Helper to open the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_OUTFITS)) {
        db.createObjectStore(STORE_OUTFITS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Generic get all
const getAll = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Generic save (add or update)
const save = async <T>(storeName: string, item: T): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Generic delete
const remove = async (storeName: string, key: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Profile specific helpers
export const saveUserProfile = async (profile: UserProfile) => {
    await save(STORE_PROFILE, profile);
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_PROFILE, 'readonly');
        const store = transaction.objectStore(STORE_PROFILE);
        const request = store.get('user-profile');
        
        request.onsuccess = () => {
            resolve(request.result || null);
        };
        request.onerror = () => reject(request.error);
    });
};

// Public API
export const storageService = {
  // Items
  getAllItems: () => getAll<ClothingItem>(STORE_ITEMS),
  saveItem: (item: ClothingItem) => save(STORE_ITEMS, item),
  deleteItem: (id: string) => remove(STORE_ITEMS, id),
  
  // Outfits
  getAllOutfits: () => getAll<Outfit>(STORE_OUTFITS),
  saveOutfit: (outfit: Outfit) => save(STORE_OUTFITS, outfit),
  deleteOutfit: (id: string) => remove(STORE_OUTFITS, id),

  // Profile
  saveUserProfile,
  getUserProfile
};
