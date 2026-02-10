
/**
 * Utility for safe LocalStorage operations and IndexedDB for large datasets.
 */

// --- LocalStorage (Sync, Small Data like Preferences) ---
export const safeLocalStorage = {
  getItem: <T>(key: string, fallback: T): T => {
    try {
      if (typeof window === 'undefined') return fallback;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[Storage] Failed to load ${key}`, e);
      return fallback;
    }
  },

  setItem: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e: any) {
      console.error(`[Storage] Error saving ${key}`, e);
      return false;
    }
  },

  removeItem: (key: string) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[Storage] Error removing ${key}`, e);
    }
  }
};

// --- IndexedDB (Async, Large Data like Blueprints/Images/Videos) ---
import { DATABASE_CONFIG } from '../config';

const DB_NAME = DATABASE_CONFIG.DB_NAME;
const DB_VERSION = DATABASE_CONFIG.DB_VERSION;
const STORE_NAME = DATABASE_CONFIG.STORE_NAME;
const ASSETS_STORE_NAME = DATABASE_CONFIG.ASSETS_STORE_NAME;

export const indexedDBService = {
  db: null as IDBDatabase | null,

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error("IndexedDB not supported"));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        // Create assets store if it doesn't exist
        if (!db.objectStoreNames.contains(ASSETS_STORE_NAME)) {
          db.createObjectStore(ASSETS_STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn(`[IndexedDB] Read failed for ${key}`, e);
      return null;
    }
  },

  async setItem(key: string, value: any): Promise<void> {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`[IndexedDB] Write failed for ${key}`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`[IndexedDB] Delete failed for ${key}`, e);
    }
  },

  // --- Asset Management (Blobs) ---

  async saveAsset(key: string, blob: Blob): Promise<void> {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(ASSETS_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(ASSETS_STORE_NAME);
        const request = store.put(blob, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`[IndexedDB] Asset save failed for ${key}`, e);
      throw e;
    }
  },

  async getAsset(key: string): Promise<Blob | null> {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(ASSETS_STORE_NAME, 'readonly');
        const store = transaction.objectStore(ASSETS_STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn(`[IndexedDB] Asset read failed for ${key}`, e);
      return null;
    }
  },

  // --- Backup & Restore ---

  async exportDatabase(): Promise<string> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll(); // Only exporting structured data, not heavy assets for now
      
      // We also need to get the keys to map them back
      const keysRequest = store.getAllKeys();

      let items: any[] = [];
      let keys: any[] = [];

      request.onsuccess = () => {
        items = request.result;
        if (keys.length > 0) finalize();
      };

      keysRequest.onsuccess = () => {
        keys = keysRequest.result;
        if (items.length > 0 || keys.length === 0) finalize();
      };

      const finalize = () => {
        const exportData = keys.map((key, i) => ({ key, value: items[i] }));
        // Also capture LocalStorage prompts
        const prompts = localStorage.getItem('trendventures_prompts_v1');
        const payload = {
          version: 1,
          timestamp: Date.now(),
          db: exportData,
          prompts: prompts ? JSON.parse(prompts) : {}
        };
        resolve(JSON.stringify(payload));
      };

      transaction.onerror = () => reject(transaction.error);
    });
  },

  async importDatabase(jsonString: string): Promise<void> {
    try {
      const payload = JSON.parse(jsonString);
      if (!payload.version || !payload.db) throw new Error("Invalid backup file format");

      // Restore Prompts
      if (payload.prompts) {
        localStorage.setItem('trendventures_prompts_v1', JSON.stringify(payload.prompts));
      }

      // Restore DB
      const db = await this.open();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // We merge, not overwrite everything, unless key conflicts
      for (const item of payload.db) {
        store.put(item.value, item.key);
      }

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error("Import failed", e);
      throw e;
    }
  }
};
