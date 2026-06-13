/**
 * IndexedDB storage for video blobs and thumbnails — enables Library replay without re-render.
 */

const DB_NAME = 'forgefactory_media';
const DB_VERSION = 1;
const VIDEO_STORE = 'videos';
const THUMB_STORE = 'thumbnails';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        db.createObjectStore(VIDEO_STORE);
      }
      if (!db.objectStoreNames.contains(THUMB_STORE)) {
        db.createObjectStore(THUMB_STORE);
      }
    };
  });
}

async function putBlob(storeName: string, id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getBlob(storeName: string, id: string): Promise<Blob | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(id);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteEntry(storeName: string, id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveVideoBlob(generationId: string, blob: Blob): Promise<void> {
  try {
    await putBlob(VIDEO_STORE, generationId, blob);
  } catch (err) {
    console.warn('Failed to save video to IndexedDB', err);
  }
}

export async function loadVideoBlob(generationId: string): Promise<string | null> {
  try {
    const blob = await getBlob(VIDEO_STORE, generationId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function saveThumbnail(generationId: string, dataUrl: string): Promise<void> {
  try {
    const blob = await fetch(dataUrl).then(r => r.blob());
    await putBlob(THUMB_STORE, generationId, blob);
  } catch (err) {
    console.warn('Failed to save thumbnail', err);
  }
}

export async function loadThumbnailUrl(generationId: string): Promise<string | null> {
  try {
    const blob = await getBlob(THUMB_STORE, generationId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function deleteMediaForGeneration(generationId: string): Promise<void> {
  try {
    await Promise.all([
      deleteEntry(VIDEO_STORE, generationId),
      deleteEntry(THUMB_STORE, generationId),
    ]);
  } catch {
    // ignore
  }
}

/** Capture a thumbnail from a video blob (first frame) */
export async function captureVideoThumbnail(blob: Blob): Promise<string | null> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, video.duration * 0.1 || 0.1);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          cleanup();
          resolve(dataUrl);
        } else {
          cleanup();
          resolve(null);
        }
      } catch {
        cleanup();
        resolve(null);
      }
    };

    video.onerror = () => {
      cleanup();
      resolve(null);
    };

    video.src = url;
  });
}