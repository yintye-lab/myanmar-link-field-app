// Offline Database for React Native using AsyncStorage
// In production, replace with expo-sqlite for full SQLite support

const STORAGE_PREFIX = 'ml_field_';

// Simple key-value storage wrapper (replace with AsyncStorage in RN)
const storage = {
  get: async (key: string) => {
    try { const v = localStorage.getItem(STORAGE_PREFIX + key); return v ? JSON.parse(v) : null; }
    catch { return null; }
  },
  set: async (key: string, value: any) => {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  },
  remove: async (key: string) => { localStorage.removeItem(STORAGE_PREFIX + key); },
};

// Tasks cache
export const saveTasksLocal = async (tasks: any[]) => storage.set('tasks', tasks);
export const getLocalTasks = async (): Promise<any[]> => (await storage.get('tasks')) || [];
export const updateLocalTask = async (task: any) => {
  const tasks = await getLocalTasks();
  const idx = tasks.findIndex((t: any) => t.task_id === task.task_id);
  if (idx >= 0) tasks[idx] = task; else tasks.push(task);
  await saveTasksLocal(tasks);
};

// Sync queue
export const getSyncQueue = async (): Promise<any[]> => (await storage.get('sync_queue')) || [];
export const addToSyncQueue = async (item: any) => {
  const queue = await getSyncQueue();
  queue.push({ ...item, id: Date.now(), queued_at: new Date().toISOString() });
  await storage.set('sync_queue', queue);
};
export const removeSyncItem = async (id: number) => {
  const queue = await getSyncQueue();
  await storage.set('sync_queue', queue.filter((i: any) => i.id !== id));
};
export const clearSyncQueue = async () => storage.set('sync_queue', []);

// Cache
export const setCache = async (key: string, data: any) => storage.set(`cache_${key}`, data);
export const getCache = async (key: string) => storage.get(`cache_${key}`);

// Photo queue (base64 strings)
export const savePhotoLocal = async (taskId: string, uri: string) => {
  const photos = (await storage.get('photo_queue')) || [];
  photos.push({ task_id: taskId, uri, saved_at: new Date().toISOString() });
  await storage.set('photo_queue', photos);
};
export const getPhotoQueue = async () => (await storage.get('photo_queue')) || [];
export const clearPhotoQueue = async () => storage.set('photo_queue', []);
