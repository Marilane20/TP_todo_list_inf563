export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

/**
 * Interface (Port) définissant les opérations de stockage.
 * Permet d'utiliser soit IndexedDB (en production/intégration),
 * soit une implémentation en mémoire (pour les tests unitaires rapides).
 */
export interface TodoRepository {
  saveProject(project: Project): Promise<void>;
  getProjectById(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  deleteProject(id: string): Promise<void>;

  saveTask(task: Task): Promise<void>;
  getTaskById(id: string): Promise<Task | undefined>;
  getTasksByProjectId(projectId: string): Promise<Task[]>;
  deleteTask(id: string): Promise<void>;
  deleteTasksByProjectId(projectId: string): Promise<void>;
}