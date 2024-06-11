import {LogSource, logger} from '../../logger/AppBuilderLogger';

interface ImageItem {
  id: number;
  data: string;
}

export const openIndexedDB = async (
  dbName: string,
  version: number,
): Promise<IDBDatabase> => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(dbName, version);

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      if (!db.objectStoreNames.contains('images')) {
        const store = db.createObjectStore('images', {
          keyPath: 'id',
          autoIncrement: false,
        });
        store.createIndex('by_id', 'id', {unique: true});
      }
    };
  });
};

export const saveImagesToIndexDB = async (
  base64Data: string,
): Promise<void> => {
  try {
    const db = await openIndexedDB('vb-image-db', 1);
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');

    const timestampId = new Date().getTime();
    const item: ImageItem = {
      id: timestampId,
      data: base64Data,
    };
    store.add(item);

    tx.oncomplete = () => {
      logger.debug(
        LogSource.Internals,
        'VIRTUAL_BACKGROUND',
        'Transaction completed',
      );
    };

    logger.debug(
      LogSource.Internals,
      'VIRTUAL_BACKGROUND',
      'Added images to the store!',
    );
  } catch (error) {
    logger.error(
      LogSource.Internals,
      'VIRTUAL_BACKGROUND',
      'Error saving images to IndexedDB',
      error,
    );
  }
};

export const retrieveImagesFromStorage = async (): Promise<string[]> => {
  return new Promise<string[]>(async (resolve, reject) => {
    try {
      const db = await openIndexedDB('vb-image-db', 1);
      const tx = db.transaction('images', 'readonly');
      const store = tx.objectStore('images');
      const cursorRequest = store.openCursor();

      const retrievedImages: string[] = [];

      cursorRequest.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest)
          .result as IDBCursorWithValue;
        if (cursor) {
          retrievedImages.push(cursor.value.data);
          cursor.continue();
        } else {
          logger.debug(
            LogSource.Internals,
            'VIRTUAL_BACKGROUND',
            'Successfully retrieved images from IndexedDB!',
          );
          resolve(retrievedImages);
        }
      };
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'VIRTUAL_BACKGROUND',
        'Error retrieving images from IndexedDB',
        error,
      );
      reject(error);
    }
  });
};

// export const convertBlobToBase64 = async (blobURL: string): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.responseType = 'blob';
//     xhr.onload = () => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         resolve(reader.result as string);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(xhr.response);
//     };
//     xhr.onerror = reject;
//     xhr.open('GET', blobURL);
//     xhr.send();
//   });
// };

export const convertBlobToBase64 = async (blobURL: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(blobURL)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
};
