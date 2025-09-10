
import { Creation, InspoImage } from '../types';

const DB_NAME = 'NanoBananaDB';
const CREATIONS_STORE_NAME = 'creations';
const INSPO_STORE_NAME = 'inspoImages';
const DB_VERSION = 2;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening DB');
    };

    request.onsuccess = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      db = dbInstance;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(CREATIONS_STORE_NAME)) {
        dbInstance.createObjectStore(CREATIONS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains(INSPO_STORE_NAME)) {
        dbInstance.createObjectStore(INSPO_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Helper to promisify READ requests
const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Helper for robust WRITE transactions
const performWriteTransaction = <T>(storeName: string, action: (store: IDBObjectStore) => IDBRequest): Promise<T> => {
    return new Promise(async (resolve, reject) => {
        try {
            const dbInstance = await initDB();
            const transaction = dbInstance.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = action(store);

            transaction.oncomplete = () => {
                resolve(request.result as T);
            };

            transaction.onerror = () => {
                console.error("Transaction error:", transaction.error);
                reject(transaction.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};

export const addCreation = (creation: Omit<Creation, 'id' | 'createdAt'> & { createdAt: string }): Promise<IDBValidKey> => {
  return performWriteTransaction<IDBValidKey>(CREATIONS_STORE_NAME, (store) => store.add(creation));
};

export const getAllCreations = async (): Promise<Creation[]> => {
  const db = await initDB();
  const transaction = db.transaction(CREATIONS_STORE_NAME, 'readonly');
  const store = transaction.objectStore(CREATIONS_STORE_NAME);
  const creations = await promisifyRequest(store.getAll());
  // Sort descending by date
  return creations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteCreation = (id: number): Promise<void> => {
  return performWriteTransaction<void>(CREATIONS_STORE_NAME, (store) => store.delete(id));
};

// --- Inspo Image Functions ---

export const addInspoImage = (image: Omit<InspoImage, 'id'>): Promise<IDBValidKey> => {
  return performWriteTransaction<IDBValidKey>(INSPO_STORE_NAME, (store) => store.add(image));
};

export const getAllInspoImages = async (): Promise<InspoImage[]> => {
  const db = await initDB();
  const transaction = db.transaction(INSPO_STORE_NAME, 'readonly');
  const store = transaction.objectStore(INSPO_STORE_NAME);
  const images = await promisifyRequest(store.getAll());
  return images.reverse();
};

export const deleteInspoImage = (id: number): Promise<void> => {
  return performWriteTransaction<void>(INSPO_STORE_NAME, (store) => store.delete(id));
};
