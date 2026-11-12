import { describe, it, expect, beforeEach } from 'vitest';
import { TodoService } from '../src/core/TodoService';
import { IndexedDBTodoRepository } from '../src/storage/IndexedDBTodoRepository';

describe('Intégration TodoService + IndexedDB', () => {
  let dbName: string;
  let service: TodoService;

  beforeEach(() => {
    // On utilise un nom de base unique par test pour garantir l'isolation
    dbName = `test_db_${crypto.randomUUID()}`;
    const repository = new IndexedDBTodoRepository(dbName);
    service = new TodoService(repository);
  });

  it('doit persister et relire un projet dans IndexedDB', async () => {
    const created = await service.createProject('Projet Persistant');

    // On simule un rechargement de page en créant une nouvelle instance sur la même base
    const reloadedService = new TodoService(new IndexedDBTodoRepository(dbName));
    const projects = await reloadedService.getAllProjects();

    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe(created.id);
    expect(projects[0].name).toBe('Projet Persistant');
  });

  it('doit persister, filtrer via l’index by_project, mettre à jour et supprimer des tâches', async () => {
    const proj1 = await service.createProject('Projet 1');
    const proj2 = await service.createProject('Projet 2');

    const t1 = await service.addTask(proj1.id, 'Tâche P1');
    await service.addTask(proj2.id, 'Tâche P2');

    // Vérification du filtrage par index IndexedDB
    const tasksProj1 = await service.getTasksByProject(proj1.id);
    expect(tasksProj1).toHaveLength(1);
    expect(tasksProj1[0].title).toBe('Tâche P1');

    // Mise à jour
    await service.updateTask(t1.id, { status: 'DONE', title: 'Tâche P1 terminée' });
    const updatedTasks = await service.getTasksByProject(proj1.id);
    expect(updatedTasks[0].status).toBe('DONE');
    expect(updatedTasks[0].title).toBe('Tâche P1 terminée');

    // Suppression d'une tâche
    await service.deleteTask(t1.id);
    expect(await service.getTasksByProject(proj1.id)).toHaveLength(0);
  });

  it('doit supprimer toutes les tâches liées lors de la suppression d’un projet', async () => {
    const project = await service.createProject('Projet temporaire');
    await service.addTask(project.id, 'Sous-tâche A');
    await service.addTask(project.id, 'Sous-tâche B');

    await service.deleteProject(project.id);

    expect(await service.getAllProjects()).toHaveLength(0);
    expect(await service.getTasksByProject(project.id)).toHaveLength(0);
  });
});