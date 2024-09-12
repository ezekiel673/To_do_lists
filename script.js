document.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);

const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const newTaskInput = document.getElementById('new-task');
const reminderTimeInput = document.getElementById('reminder-time');

// Load sound effects
const addSound = document.getElementById('add-sound');
const deleteSound = document.getElementById('delete-sound');
const completeSound = document.getElementById('complete-sound');

addTaskButton.addEventListener('click', addTask);

function addTask() {
  const taskText = newTaskInput.value.trim();
  const reminderTime = reminderTimeInput.value;

  if (taskText === '') {
    alert('Please enter a task.');
    return;
  }

  const task = {
    id: Date.now(), // Unique ID for each task
    text: taskText,
    reminder: reminderTime,
    completed: false
  };

  addTaskToDOM(task);
  saveTaskToLocalStorage(task);
  setAlarmForTask(task);

  // Play add sound
  addSound.play();

  newTaskInput.value = '';
  reminderTimeInput.value = '';
}

function addTaskToDOM(task) {
  // Check if task already exists in the DOM
  const existingTaskElement = document.querySelector(`li[data-id="${task.id}"]`);
  if (existingTaskElement) {
    existingTaskElement.remove(); // Remove existing task if it exists
  }

  const li = document.createElement('li');
  li.setAttribute('data-id', task.id); // Set task ID to identify the task in the DOM
  li.innerHTML = `
    <span>
      <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTaskCompletion(this)">
      ${task.text}
      ${task.reminder ? `<span class="reminder">⏰ ${new Date(task.reminder).toLocaleString()}</span>` : ''}
    </span>
    <button onclick="deleteTask(this)">Delete</button>
  `;

  if (task.completed) {
    li.classList.add('completed');
  }

  taskList.appendChild(li);
}

function toggleTaskCompletion(checkbox) {
  const taskElement = checkbox.closest('li');
  const taskId = taskElement.getAttribute('data-id'); // Get task ID

  if (checkbox.checked) {
    taskElement.classList.add('completed');
    // Play completion sound
    completeSound.play();
    setTimeout(() => {
      taskElement.remove();
    }, 500);
  } else {
    taskElement.classList.remove('completed');
  }

  const tasks = getTasksFromLocalStorage();
  tasks.forEach(task => {
    if (task.id == taskId) {
      task.completed = checkbox.checked; // Update completion status
    }
  });

  saveTasksToLocalStorage(tasks);
}

function deleteTask(button) {
  const taskElement = button.closest('li');
  const taskId = taskElement.getAttribute('data-id'); // Get task ID

  // Add removal animation
  taskElement.classList.add('removed');

  // Play delete sound
  deleteSound.play();

  setTimeout(() => {
    taskElement.remove();
  }, 500);

  // Remove task from local storage
  const tasks = getTasksFromLocalStorage();
  const updatedTasks = tasks.filter(task => task.id != taskId); // Remove task by ID
  saveTasksToLocalStorage(updatedTasks);
}

function saveTaskToLocalStorage(task) {
  const tasks = getTasksFromLocalStorage();
  // Remove existing task if it already exists
  const existingTaskIndex = tasks.findIndex(t => t.id === task.id);
  if (existingTaskIndex !== -1) {
    tasks[existingTaskIndex] = task;
  } else {
    tasks.push(task);
  }
  saveTasksToLocalStorage(tasks);
}

function getTasksFromLocalStorage() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasksToLocalStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const tasks = getTasksFromLocalStorage();
  tasks.forEach(task => {
    addTaskToDOM(task);
    if (task.reminder) {
      setAlarmForTask(task);
    }
  });
}

// Load reminder sound
const reminderSound = document.getElementById('reminder-sound');

function setAlarmForTask(task) {
  if (!task.reminder) return;

  const reminderTime = new Date(task.reminder).getTime();
  const now = new Date().getTime();
  
  const timeUntilReminder = reminderTime - now;

  // Only set reminder if the time is in the future
  if (timeUntilReminder > 0) {
    setTimeout(() => {
      reminderSound.play(); // Play reminder sound before the alert
      setTimeout(() => {
        alert(`Reminder: ${task.text}`); // Show alert after a short delay for sound
      }, 500);
    }, timeUntilReminder);
  }
}

