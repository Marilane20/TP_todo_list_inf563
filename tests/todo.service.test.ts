import { describe, it, expect, beforeEach } from 'vitest';
import { TodoService } from '../src/core/TodoService';
import { InMemoryTodoRepository } from './InMemoryTodoRepository';

describe('TodoService - Logique Métier (TDD)', () => {
  let service: TodoService;
  let repository: InMemoryTodoRepository;

  beforeEach(() => {
    repository = new InMemoryTodoRepository();
    service = new TodoService(repository);
  });

  describe('Gestion des Projets', () => {
    it('doit créer un projet valide et nettoyer les espaces inutiles', async () => {
      const project = await service.createProject('  INF563 V&V  ');

      expect(project.id).toBeDefined();
      expect(project.name).toBe('INF563 V&V');
      expect(project.createdAt).toBeDefined();

      const allProjects = await service.getAllProjects();
      expect(allProjects).toHaveLength(1);
      expect(allProjects[0].name).toBe('INF563 V&V');
    });

    it('doit refuser la création d’un projet avec un nom vide ou uniquement des espaces', async () => {
      await expect(service.createProject('')).rejects.toThrow(
        'Le nom du projet ne peut pas être vide'
      );
      await expect(service.createProject('    ')).rejects.toThrow(
        'Le nom du projet ne peut pas être vide'
      );
    });

    it('doit supprimer un projet ainsi que toutes ses tâches associées', async () => {
      const project = await service.createProject('Projet à supprimer');
      await service.addTask(project.id, 'Tâche 1');
      await service.addTask(project.id, 'Tâche 2');

      await service.deleteProject(project.id);

      const projects = await service.getAllProjects();
      const tasks = await service.getTasksByProject(project.id);
      expect(projects).toHaveLength(0);
      expect(tasks).toHaveLength(0);
    });
  });

  describe('Gestion des Tâches', () => {
    it('doit ajouter une tâche avec le statut initial TODO à un projet existant', async () => {
      const project = await service.createProject('Master 2');
      const task = await service.addTask(project.id, '  Écrire les tests Stryker  ');

      expect(task.id).toBeDefined();
      expect(task.projectId).toBe(project.id);
      expect(task.title).toBe('Écrire les tests Stryker');
      expect(task.status).toBe('TODO');
    });

    it('doit refuser l’ajout d’une tâche si le titre est vide', async () => {
      const project = await service.createProject('Master 2');

      await expect(service.addTask(project.id, '')).rejects.toThrow(
        'Le titre de la tâche ne peut pas être vide'
      );
      await expect(service.addTask(project.id, '   ')).rejects.toThrow(
        'Le titre de la tâche ne peut pas être vide'
      );
    });

    it('doit refuser l’ajout d’une tâche si le projet parent n’existe pas', async () => {
      await expect(service.addTask('id-inexistant', 'Ma tâche')).rejects.toThrow(
        'Le projet spécifié est introuvable'
      );
    });

    it('doit isoler les tâches par projet', async () => {
      const projA = await service.createProject('Projet A');
      const projB = await service.createProject('Projet B');

      await service.addTask(projA.id, 'Tâche A1');
      await service.addTask(projB.id, 'Tâche B1');

      const tasksA = await service.getTasksByProject(projA.id);
      expect(tasksA).toHaveLength(1);
      expect(tasksA[0].title).toBe('Tâche A1');
    });

    it('doit modifier le titre et le statut d’une tâche existante', async () => {
      const project = await service.createProject('Master 2');
      const task = await service.addTask(project.id, 'Ancien titre');

      const updated = await service.updateTask(task.id, {
        title: '  Nouveau titre  ',
        status: 'DONE'
      });

      expect(updated.title).toBe('Nouveau titre');
      expect(updated.status).toBe('DONE');
    });

    it('doit permettre de modifier uniquement le statut sans modifier le titre', async () => {
      const project = await service.createProject('Master 2');
      const task = await service.addTask(project.id, 'Titre inchangé');

      const updated = await service.updateTask(task.id, { status: 'IN_PROGRESS' });

      expect(updated.title).toBe('Titre inchangé');
      expect(updated.status).toBe('IN_PROGRESS');
    });

    it('doit permettre de modifier uniquement le titre sans modifier le statut', async () => {
      const project = await service.createProject('Master 2');
      const task = await service.addTask(project.id, 'Titre initial');

      const updated = await service.updateTask(task.id, { title: 'Titre modifié' });

      expect(updated.title).toBe('Titre modifié');
      expect(updated.status).toBe('TODO');
    });

    it('doit refuser la modification si la tâche est introuvable ou le nouveau titre vide', async () => {
      await expect(
        service.updateTask('tache-inconnue', { status: 'DONE' })
      ).rejects.toThrow('Tâche introuvable');

      const project = await service.createProject('Master 2');
      const task = await service.addTask(project.id, 'Titre valide');

      await expect(
        service.updateTask(task.id, { title: '   ' })
      ).rejects.toThrow('Le titre de la tâche ne peut pas être vide');
    });

    it('doit supprimer une tâche spécifique', async () => {
      const project = await service.createProject('Master 2');
      const t1 = await service.addTask(project.id, 'Tâche 1');
      const t2 = await service.addTask(project.id, 'Tâche 2');

      await service.deleteTask(t1.id);

      const remaining = await service.getTasksByProject(project.id);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(t2.id);
    });
  });
});