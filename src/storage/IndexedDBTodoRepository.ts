import { Project, Task, TodoRepository } from '../core/models';

const DB_NAME = 'TodoVVDatabase';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_TASKS = 'tasks';

export class IndexedDBTodoRepository implements TodoRepository {
  private dbPromise: Promise<IDBDatabase>;

  constructor(dbName: string = DB_NAME) {
    this.dbPromise = this.initDB(dbName);
  }

  private initDB(dbName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_TASKS)) {
          const taskStore = db.createObjectStore(STORE_TASKS, { keyPath: 'id' });
          taskStore.createIndex('by_project', 'projectId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
    });
  }

  private async runTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB transaction failed'));
    });
  }

  async saveProject(project: Project): Promise<void> {
    await this.runTransaction(STORE_PROJECTS, 'readwrite', (store) => store.put(project));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.runTransaction(STORE_PROJECTS, 'readonly', (store) => store.get(id));
  }

  async getAllProjects(): Promise<Project[]> {
    return this.runTransaction(STORE_PROJECTS, 'readonly', (store) => store.getAll());
  }

  async deleteProject(id: string): Promise<void> {
    await this.runTransaction(STORE_PROJECTS, 'readwrite', (store) => store.delete(id));
  }

  async saveTask(task: Task): Promise<void> {
    await this.runTransaction(STORE_TASKS, 'readwrite', (store) => store.put(task));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.runTransaction(STORE_TASKS, 'readonly', (store) => store.get(id));
  }

  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TASKS, 'readonly');
      const store = tx.objectStore(STORE_TASKS);
      const index = store.index('by_project');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Failed to fetch tasks by project'));
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.runTransaction(STORE_TASKS, 'readwrite', (store) => store.delete(id));
  }

  async deleteTasksByProjectId(projectId: string): Promise<void> {
    const tasks = await this.getTasksByProjectId(projectId);
    for (const task of tasks) {
      await this.deleteTask(task.id);
    }
  }
}