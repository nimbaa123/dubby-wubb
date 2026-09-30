import type { Pack } from "@/lib/data";

const DB_NAME = "dubby-wubb-packs";
const STORE_NAME = "published";

function openPackDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "slug" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePublishedPack(pack: Pack, video: Blob): Promise<void> {
  const db = await openPackDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ ...pack, video, videoUrl: undefined });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadPublishedPack(slug: string): Promise<Pack | undefined> {
  const db = await openPackDb();
  const record = await new Promise<(Omit<Pack, "videoUrl"> & { video: Blob }) | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(slug);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  if (!record) return undefined;
  const { video, ...packData } = record;
  return { ...packData, videoUrl: URL.createObjectURL(video) };
}

export async function listPublishedPacks(): Promise<Pack[]> {
  const db = await openPackDb();
  const records = await new Promise<Array<Omit<Pack, "videoUrl"> & { video: Blob }>>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return records.map(({ video, ...packData }) => ({ ...packData, videoUrl: URL.createObjectURL(video) }));
}