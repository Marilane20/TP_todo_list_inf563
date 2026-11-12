import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { Given, When, Then, Before } from '@cucumber/cucumber';
import { TodoService } from '../../src/core/TodoService.js';
import { IndexedDBTodoRepository } from '../../src/storage/IndexedDBTodoRepository.js';
import { TaskStatus } from '../../src/core/models.js';

let service: TodoService;

Before(() => {
  const dbName = `bdd_db_${crypto.randomUUID()}`;
  service = new TodoService(new IndexedDBTodoRepository(dbName));
});

Given('une application Todo initialisée avec IndexedDB', async () => {
  const projects = await service.getAllProjects();
  assert.equal(projects.length, 0);
});

Given('un projet existant nommé {string}', async (projectName: string) => {
  await service.createProject(projectName);
});

Given(
  'une tâche {string} dans le projet {string}',
  async (taskTitle: string, projectName: string) => {
    const projects = await service.getAllProjects();
    const project = projects.find((p) => p.name === projectName);
    assert.ok(project, `Projet "${projectName}" introuvable`);
    await service.addTask(project.id, taskTitle);
  }
);

When('je crée un projet nommé {string}', async (projectName: string) => {
  await service.createProject(projectName);
});

When(
  'j\'ajoute la tâche {string} au projet {string}',
  async (taskTitle: string, projectName: string) => {
    const projects = await service.getAllProjects();
    const project = projects.find((p) => p.name === projectName);
    assert.ok(project, `Projet "${projectName}" introuvable`);
    await service.addTask(project.id, taskTitle);
  }
);

When(
  'je change le statut de la tâche {string} du projet {string} vers {string}',
  async (taskTitle: string, projectName: string, newStatus: string) => {
    const projects = await service.getAllProjects();
    const project = projects.find((p) => p.name === projectName);
    assert.ok(project);

    const tasks = await service.getTasksByProject(project.id);
    const task = tasks.find((t) => t.title === taskTitle);
    assert.ok(task);

    await service.updateTask(task.id, { status: newStatus as TaskStatus });
  }
);

When(
  'je supprime la tâche {string} du projet {string}',
  async (taskTitle: string, projectName: string) => {
    const projects = await service.getAllProjects();
    const project = projects.find((p) => p.name === projectName);
    assert.ok(project);

    const tasks = await service.getTasksByProject(project.id);
    const task = tasks.find((t) => t.title === taskTitle);
    assert.ok(task);

    await service.deleteTask(task.id);
  }
);

Then(
  'le projet {string} doit contenir {int} tâche(s)',
  async (projectName: string, expectedCount: number) => {
    const projects = await service.getAllProjects();
    const project = projects.find((p) => p.name === projectName);
    assert.ok(project);

    const tasks = await service.getTasksByProject(project.id);
    assert.equal(tasks.length, expectedCount);
  }
);

Then(
  'la tâche {string} du projet {string} doit avoir le statut {string}',
  async (taskTitle: string, projectName: string, expectedStatus: string) => {
    const projects = await service.getAllProjects();
    const project = projects.find((p) => p.name === projectName);
    assert.ok(project);

    const tasks = await service.getTasksByProject(project.id);
    const task = tasks.find((t) => t.title === taskTitle);
    assert.ok(task);
    assert.equal(task.status, expectedStatus);
  }
);