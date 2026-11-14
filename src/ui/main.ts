import { TodoService } from '../core/TodoService';
import { TaskStatus } from '../core/models';
import { IndexedDBTodoRepository } from '../storage/IndexedDBTodoRepository';

const repository = new IndexedDBTodoRepository();
const service = new TodoService(repository);

let selectedProjectId: string | null = null;

const projectForm = document.getElementById('project-form') as HTMLFormElement;
const projectNameInput = document.getElementById('project-name') as HTMLInputElement;
const projectListEl = document.getElementById('project-list') as HTMLUListElement;

const currentProjectTitleEl = document.getElementById('current-project-title') as HTMLElement;
const taskForm = document.getElementById('task-form') as HTMLFormElement;
const taskTitleInput = document.getElementById('task-title') as HTMLInputElement;
const taskListEl = document.getElementById('task-list') as HTMLUListElement;

async function renderProjects(): Promise<void> {
  const projects = await service.listProjects();
  projectListEl.innerHTML = '';

  for (const project of projects) {
    const li = document.createElement('li');
    if (project.id === selectedProjectId) {
      li.classList.add('active');
    }

    const span = document.createElement('span');
    span.className = 'project-item';
    span.textContent = project.name;
    span.onclick = () => {
      selectedProjectId = project.id;
      currentProjectTitleEl.textContent = `Tâches : ${project.name}`;
      taskForm.style.display = 'flex';
      void renderProjects();
      void renderTasks();
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'danger';
    delBtn.textContent = 'Suppr';
    delBtn.onclick = async () => {
      await service.deleteProject(project.id);
      if (selectedProjectId === project.id) {
        selectedProjectId = null;
        currentProjectTitleEl.textContent = 'Sélectionnez un projet';
        taskForm.style.display = 'none';
        taskListEl.innerHTML = '';
      }
      await renderProjects();
    };

    li.append(span, delBtn);
    projectListEl.appendChild(li);
  }
}

async function renderTasks(): Promise<void> {
  if (!selectedProjectId) return;
  const tasks = await service.listTasksByProject(selectedProjectId);
  taskListEl.innerHTML = '';

  for (const task of tasks) {
    const li = document.createElement('li');

    const titleSpan = document.createElement('span');
    titleSpan.style.flex = '1';
    titleSpan.textContent = task.title;
    if (task.status === 'DONE') {
      titleSpan.style.textDecoration = 'line-through';
    }

    const select = document.createElement('select');
    const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    for (const st of statuses) {
      const option = document.createElement('option');
      option.value = st;
      option.textContent = st;
      option.selected = task.status === st;
      select.appendChild(option);
    }
    select.onchange = async () => {
      await service.updateTask(task.id, { status: select.value as TaskStatus });
      await renderTasks();
    };

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Renommer';
    editBtn.onclick = async () => {
      const newTitle = prompt('Nouveau titre :', task.title);
      if (newTitle && newTitle.trim().length > 0) {
        await service.updateTask(task.id, { title: newTitle });
        await renderTasks();
      }
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'danger';
    delBtn.textContent = 'X';
    delBtn.onclick = async () => {
      await service.deleteTask(task.id);
      await renderTasks();
    };

    li.append(titleSpan, select, editBtn, delBtn);
    taskListEl.appendChild(li);
  }
}

projectForm.onsubmit = async (e) => {
  e.preventDefault();
  await service.createProject(projectNameInput.value);
  projectNameInput.value = '';
  await renderProjects();
};

taskForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!selectedProjectId) return;
  await service.addTask(selectedProjectId, taskTitleInput.value);
  taskTitleInput.value = '';
  await renderTasks();
};

void renderProjects();