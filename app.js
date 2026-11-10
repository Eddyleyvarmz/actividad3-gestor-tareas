'use strict';

// Clave utilizada para guardar los registros en localStorage.
const STORAGE_KEY = 'taskflow_tareas_v1';

// Arreglo principal: cada tarea se representa mediante un objeto.
let tasks = loadTasks();
let editingTaskId = null;

// Referencias a los elementos del DOM.
const taskForm = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const descriptionInput = document.querySelector('#task-description');
const categoryInput = document.querySelector('#task-category');
const priorityInput = document.querySelector('#task-priority');
const dateInput = document.querySelector('#task-date');
const formHeading = document.querySelector('#form-heading');
const formMessage = document.querySelector('#form-message');
const submitButton = document.querySelector('#submit-button');
const cancelEditButton = document.querySelector('#cancel-edit');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyDescription = document.querySelector('#empty-description');
const searchInput = document.querySelector('#search-input');
const statusFilter = document.querySelector('#status-filter');
const categoryFilter = document.querySelector('#category-filter');

/** Recupera las tareas guardadas. Si no existen o hay datos dañados, devuelve []. */
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) return [];

    const parsedTasks = JSON.parse(savedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch (error) {
    console.error('No fue posible recuperar las tareas:', error);
    return [];
  }
}

/** Guarda el arreglo completo en el almacenamiento local del navegador. */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('No fue posible guardar las tareas:', error);
    showFormMessage('No se pudieron guardar los datos. Revisa el almacenamiento del navegador.');
  }
}

/** Genera un identificador único para cada registro. */
const createId = () => (window.crypto?.randomUUID
  ? window.crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/** Devuelve la fecha actual sin depender de conversiones UTC. */
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Presenta una fecha ISO como una fecha legible en español. */
function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(date);
}

function showFormMessage(message, type = 'error') {
  formMessage.textContent = message;
  formMessage.classList.toggle('success', type === 'success');
}

/** Valida los campos antes de crear o actualizar un registro. */
function validateTask(title) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return 'Escribe el nombre de la tarea.';
  if (cleanTitle.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (cleanTitle.length > 80) return 'El nombre no puede superar 80 caracteres.';
  return '';
}

/** Construye un objeto de tarea a partir del formulario. */
function getTaskFromForm() {
  return {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    category: categoryInput.value,
    priority: priorityInput.value,
    dueDate: dateInput.value
  };
}

/** Reinicia el formulario y sale del modo de edición. */
function resetForm() {
  taskForm.reset();
  editingTaskId = null;
  formHeading.textContent = 'Agregar tarea';
  submitButton.innerHTML = 'Guardar tarea <span aria-hidden="true">→</span>';
  cancelEditButton.classList.add('hidden');
  showFormMessage('');
}

/** Agrega una tarea o actualiza la que está seleccionada para edición. */
function handleFormSubmit(event) {
  event.preventDefault();
  const formData = getTaskFromForm();
  const validationMessage = validateTask(formData.title);

  if (validationMessage) {
    showFormMessage(validationMessage);
    titleInput.focus();
    return;
  }

  if (editingTaskId) {
    tasks = tasks.map(task => task.id === editingTaskId
      ? { ...task, ...formData, updatedAt: new Date().toISOString() }
      : task);
    saveTasks();
    resetForm();
    render();
    showFormMessage('Tarea actualizada correctamente.', 'success');
    return;
  }

  const newTask = {
    id: createId(),
    ...formData,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks = [newTask, ...tasks];
  saveTasks();
  resetForm();
  render();
  showFormMessage('Tarea agregada correctamente.', 'success');
}

/** Carga los datos de una tarea en el formulario para permitir su edición. */
function startEditing(taskId) {
  const task = tasks.find(item => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  titleInput.value = task.title;
  descriptionInput.value = task.description || '';
  categoryInput.value = task.category || 'Otro';
  priorityInput.value = task.priority || 'Media';
  dateInput.value = task.dueDate || '';
  formHeading.textContent = 'Editar tarea';
  submitButton.innerHTML = 'Guardar cambios <span aria-hidden="true">→</span>';
  cancelEditButton.classList.remove('hidden');
  showFormMessage('Modifica los datos y guarda los cambios.');
  titleInput.focus();
  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Cambia el estado de una tarea entre pendiente y completada. */
function toggleTask(taskId) {
  tasks = tasks.map(task => task.id === taskId
    ? { ...task, completed: !task.completed }
    : task);
  saveTasks();
  render();
}

/** Elimina un registro después de solicitar confirmación. */
function deleteTask(taskId) {
  const task = tasks.find(item => item.id === taskId);
  if (!task) return;
  const confirmed = window.confirm(`¿Deseas eliminar la tarea "${task.title}"?`);
  if (!confirmed) return;

  tasks = tasks.filter(item => item.id !== taskId);
  if (editingTaskId === taskId) resetForm();
  saveTasks();
  render();
}

/** Elimina todas las tareas completadas. */
function clearCompletedTasks() {
  const completedCount = tasks.filter(task => task.completed).length;
  if (completedCount === 0) {
    showFormMessage('No hay tareas completadas para eliminar.');
    return;
  }

  const confirmed = window.confirm(`¿Eliminar ${completedCount} tarea(s) completada(s)?`);
  if (!confirmed) return;

  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
  if (editingTaskId && !tasks.some(task => task.id === editingTaskId)) resetForm();
}

/** Aplica búsqueda y filtros usando filter() e includes(). */
function getVisibleTasks() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase('es-MX');
  const selectedStatus = statusFilter.value;
  const selectedCategory = categoryFilter.value;

  return tasks
    .filter(task => {
      const matchesSearch = `${task.title} ${task.description || ''}`
        .toLocaleLowerCase('es-MX').includes(searchTerm);
      const matchesStatus = selectedStatus === 'all'
        || (selectedStatus === 'completed' ? task.completed : !task.completed);
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      // Las tareas pendientes aparecen primero; después se ordenan por prioridad.
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      const priorityOrder = { Alta: 0, Media: 1, Baja: 2 };
      return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    });
}

/** Crea una etiqueta de texto sin insertar HTML proporcionado por el usuario. */
function createTag(text, className = '') {
  const tag = document.createElement('span');
  tag.className = `tag ${className}`.trim();
  tag.textContent = text;
  return tag;
}

/** Construye y devuelve el elemento visual de una tarea. */
function createTaskElement(task) {
  const article = document.createElement('article');
  article.className = `task-item${task.completed ? ' is-completed' : ''}`;
  article.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'complete-toggle';
  checkbox.checked = Boolean(task.completed);
  checkbox.setAttribute('aria-label', `Marcar "${task.title}" como ${task.completed ? 'pendiente' : 'completada'}`);
  checkbox.dataset.action = 'toggle';

  const content = document.createElement('div');
  content.className = 'task-content';

  const title = document.createElement('h3');
  title.className = 'task-title';
  title.textContent = task.title;
  content.append(title);

  if (task.description) {
    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description;
    content.append(description);
  }

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  meta.append(createTag(task.category || 'Otro'));

  const priorityClass = {
    Alta: 'priority-high', Media: 'priority-medium', Baja: 'priority-low'
  }[task.priority] || 'priority-medium';
  meta.append(createTag(`Prioridad ${task.priority || 'Media'}`, priorityClass));

  if (task.dueDate) {
    const dueDate = document.createElement('span');
    const isOverdue = !task.completed && task.dueDate < getLocalDateString();
    dueDate.className = `due-date${isOverdue ? ' overdue' : ''}`;
    dueDate.textContent = `${isOverdue ? 'Vencida · ' : 'Límite · '}${formatDate(task.dueDate)}`;
    meta.append(dueDate);
  }
  content.append(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'icon-button';
  editButton.dataset.action = 'edit';
  editButton.title = 'Editar tarea';
  editButton.setAttribute('aria-label', `Editar ${task.title}`);
  editButton.textContent = '✎';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'icon-button delete';
  deleteButton.dataset.action = 'delete';
  deleteButton.title = 'Eliminar tarea';
  deleteButton.setAttribute('aria-label', `Eliminar ${task.title}`);
  deleteButton.textContent = '×';

  actions.append(editButton, deleteButton);
  article.append(checkbox, content, actions);
  return article;
}

/** Actualiza contadores, barra de progreso y lista sin recargar la página. */
function render() {
  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const visibleTasks = getVisibleTasks();

  document.querySelector('#total-count').textContent = tasks.length;
  document.querySelector('#pending-count').textContent = pendingCount;
  document.querySelector('#completed-count').textContent = completedCount;
  document.querySelector('#progress-value').textContent = `${progress}%`;
  document.querySelector('#progress-fill').style.width = `${progress}%`;
  document.querySelector('#progress-bar').setAttribute('aria-valuenow', String(progress));
  document.querySelector('#visible-count').textContent = visibleTasks.length;

  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  const hasVisibleTasks = visibleTasks.length > 0;
  emptyState.classList.toggle('hidden', hasVisibleTasks);

  if (!hasVisibleTasks) {
    const hasFilters = Boolean(searchInput.value.trim())
      || statusFilter.value !== 'all'
      || categoryFilter.value !== 'all';
    emptyTitle.textContent = hasFilters ? 'No se encontraron resultados' : 'Aún no tienes tareas';
    emptyDescription.textContent = hasFilters
      ? 'Prueba con otra búsqueda o cambia los filtros seleccionados.'
      : 'Agrega tu primera tarea desde el formulario para comenzar.';
  }
}

// Delegación de eventos: una sola escucha administra las acciones de cada tarea.
taskList.addEventListener('click', event => {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) return;
  const taskItem = actionButton.closest('.task-item');
  if (!taskItem) return;

  const { id } = taskItem.dataset;
  if (actionButton.dataset.action === 'edit') startEditing(id);
  if (actionButton.dataset.action === 'delete') deleteTask(id);
});

taskList.addEventListener('change', event => {
  if (event.target.matches('input[data-action="toggle"]')) {
    const taskId = event.target.closest('.task-item')?.dataset.id;
    if (taskId) toggleTask(taskId);
  }
});

taskForm.addEventListener('submit', handleFormSubmit);
cancelEditButton.addEventListener('click', resetForm);
searchInput.addEventListener('input', render);
statusFilter.addEventListener('change', render);
categoryFilter.addEventListener('change', render);
document.querySelector('#clear-completed').addEventListener('click', clearCompletedTasks);

// Fecha visible y primera representación de la aplicación.
document.querySelector('#today-date').textContent = new Intl.DateTimeFormat('es-MX', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
}).format(new Date());
render();
