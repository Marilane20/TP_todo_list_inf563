import { TodoService } from '../core/TodoService.js';
import { IndexedDBTodoRepository } from '../storage/IndexedDBTodoRepository.js';
import { TaskStatus } from '../core/models.js';

const service = new TodoService(new IndexedDBTodoRepository('todo_vv_browser_db'));
let selectedProjectId: string | null = null;

const projectForm = document.getElementById('project-form') as HTMLFormElement;
const projectInput = document.getElementById('project-input') as HTMLInputElement;
const projectList = document.getElementById('project-list') as HTMLUListElement;

const currentProjectTitle = document.getElementById('current-project-title') as HTMLHeadingElement;
const taskForm = document.getElementById('task-form') as HTMLFormElement;
const taskInput = document.getElementById('task-input') as HTMLInputElement;
const taskList = document.getElementById('task-list') as HTMLUListElement;

async function renderProjects(): Promise<void> {
  const projects = await service.getAllProjects();
  projectList.innerHTML = '';

  if (projects.length === 0) {
    selectedProjectId = null;
  } else if (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId)) {
    selectedProjectId = projects[0].id;
  }

  for (const project of projects) {
    const li = document.createElement('li');
    if (project.id === selectedProjectId) li.classList.add('active');

    const span = document.createElement('span');
    span.className = 'project-name';
    span.textContent = project.name;
    span.onclick = async () => {
      selectedProjectId = project.id;
      await renderAll();
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'danger';
    delBtn.textContent = 'X';
    delBtn.title = 'Supprimer le projet';
    delBtn.onclick = async () => {
      await service.deleteProject(project.id);
      await renderAll();
    };

    li.append(span, delBtn);
    projectList.appendChild(li);
  }
}

async function renderTasks(): Promise<void> {
  taskList.innerHTML = '';

  if (!selectedProjectId) {
    currentProjectTitle.textContent = 'Créez ou sélectionnez un projet';
    taskForm.style.display = 'none';
    return;
  }

  const projects = await service.getAllProjects();
  const currentProject = projects.find((p) => p.id === selectedProjectId);
  currentProjectTitle.textContent = `Tâches : ${currentProject?.name ?? ''}`;
  taskForm.style.display = 'flex';

  const tasks = await service.getTasksByProject(selectedProjectId);

  for (const task of tasks) {
    const li = document.createElement('li');

    const titleSpan = document.createElement('span');
    titleSpan.textContent = task.title;
    titleSpan.style.flex = '1';
    if (task.status === 'DONE') titleSpan.classList.add('done');

    const statusSelect = document.createElement('select');
    (['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).forEach((status) => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      option.selected = task.status === status;
      statusSelect.appendChild(option);
    });
    statusSelect.onchange = async () => {
      await service.updateTask(task.id, { status: statusSelect.value as TaskStatus });
      await renderTasks();
    };

    const editBtn = document.createElement('button');
    editBtn.className = 'secondary';
    editBtn.textContent = 'Éditer';
    editBtn.onclick = async () => {
      const newTitle = prompt('Nouveau titre de la tâche :', task.title);
      if (newTitle !== null && newTitle.trim() !== '') {
        await service.updateTask(task.id, { title: newTitle });
        await renderTasks();
      }
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'danger';
    delBtn.textContent = 'Suppr';
    delBtn.onclick = async () => {
      await service.deleteTask(task.id);
      await renderTasks();
    };

    li.append(titleSpan, statusSelect, editBtn, delBtn);
    taskList.appendChild(li);
  }
}

async function renderAll(): Promise<void> {
  await renderProjects();
  await renderTasks();
}

projectForm.onsubmit = async (e) => {
  e.preventDefault();
  try {
    const created = await service.createProject(projectInput.value);
    selectedProjectId = created.id;
    projectInput.value = '';
    await renderAll();
  } catch (err) {
    alert((err as Error).message);
  }
};

taskForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!selectedProjectId) return;
  try {
    await service.addTask(selectedProjectId, taskInput.value);
    taskInput.value = '';
    await renderTasks();
  } catch (err) {
    alert((err as Error).message);
  }
};

renderAll();