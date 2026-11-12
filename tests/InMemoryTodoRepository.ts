import { Project, Task, TodoRepository } from '../src/core/models';

export class InMemoryTodoRepository implements TodoRepository {
  private projects: Map<string, Project> = new Map();
  private tasks: Map<string, Task> = new Map();

  async saveProject(project: Project): Promise<void> {
    this.projects.set(project.id, { ...project });
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const project = this.projects.get(id);
    return project ? { ...project } : undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async saveTask(task: Task): Promise<void> {
    this.tasks.set(task.id, { ...task });
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    return task ? { ...task } : undefined;
  }

  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId
    );
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async deleteTasksByProjectId(projectId: string): Promise<void> {
    for (const [id, task] of this.tasks.entries()) {
      if (task.projectId === projectId) {
        this.tasks.delete(id);
      }
    }
  }
}