import { Project, Task, TodoRepository } from '../core/models.js';

export class IndexedDBTodoRepository implements TodoRepository {
  private readonly dbName: string;
  private readonly dbVersion = 1;

  constructor(dbName = 'todo_vv_db') {
    this.dbName = dbName;
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by_project', 'projectId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async runTransaction<T>(
    storeName: 'projects' | 'tasks',
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  // --- PROJETS ---

  async saveProject(project: Project): Promise<void> {
    await this.runTransaction('projects', 'readwrite', (store) =>
      store.put(project)
    );
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.runTransaction('projects', 'readonly', (store) =>
      store.get(id)
    );
  }

  async getAllProjects(): Promise<Project[]> {
    return this.runTransaction('projects', 'readonly', (store) =>
      store.getAll()
    );
  }

  async deleteProject(id: string): Promise<void> {
    await this.runTransaction('projects', 'readwrite', (store) =>
      store.delete(id)
    );
  }

  // --- TÂCHES ---

  async saveTask(task: Task): Promise<void> {
    await this.runTransaction('tasks', 'readwrite', (store) => store.put(task));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.runTransaction('tasks', 'readonly', (store) => store.get(id));
  }

  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readonly');
      const store = transaction.objectStore('tasks');
      const index = store.index('by_project');
      const request = index.getAll(IDBKeyRange.only(projectId));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.runTransaction('tasks', 'readwrite', (store) =>
      store.delete(id)
    );
  }

  async deleteTasksByProjectId(projectId: string): Promise<void> {
    const tasks = await this.getTasksByProjectId(projectId);
    for (const task of tasks) {
      await this.deleteTask(task.id);
    }
  }
}