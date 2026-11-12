import { Project, Task, TaskStatus, TodoRepository } from './models.js';

export interface UpdateTaskInput {
  title?: string;
  status?: TaskStatus;
}

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  private generateId(): string {
    return crypto.randomUUID();
  }

  // --- GESTION DES PROJETS ---

  async createProject(name: string): Promise<Project> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Le nom du projet ne peut pas être vide');
    }

    const project: Project = {
      id: this.generateId(),
      name: trimmedName,
      createdAt: new Date().toISOString(),
    };

    await this.repository.saveProject(project);
    return project;
  }

  async getAllProjects(): Promise<Project[]> {
    return this.repository.getAllProjects();
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.repository.deleteTasksByProjectId(projectId);
    await this.repository.deleteProject(projectId);
  }

  // --- GESTION DES TÂCHES ---

  async addTask(projectId: string, title: string): Promise<Task> {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      throw new Error('Le titre de la tâche ne peut pas être vide');
    }

    const project = await this.repository.getProjectById(projectId);
    if (!project) {
      throw new Error('Le projet spécifié est introuvable');
    }

    const task: Task = {
      id: this.generateId(),
      projectId,
      title: trimmedTitle,
      status: 'TODO',
      createdAt: new Date().toISOString(),
    };

    await this.repository.saveTask(task);
    return task;
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.repository.getTasksByProjectId(projectId);
  }

  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
    const existingTask = await this.repository.getTaskById(taskId);
    if (!existingTask) {
      throw new Error('Tâche introuvable');
    }

    let updatedTitle = existingTask.title;
    if (updates.title !== undefined) {
      const trimmedTitle = updates.title.trim();
      if (trimmedTitle.length === 0) {
        throw new Error('Le titre de la tâche ne peut pas être vide');
      }
      updatedTitle = trimmedTitle;
    }

    const updatedTask: Task = {
      ...existingTask,
      title: updatedTitle,
      status: updates.status ?? existingTask.status,
    };

    await this.repository.saveTask(updatedTask);
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.repository.deleteTask(taskId);
  }
}