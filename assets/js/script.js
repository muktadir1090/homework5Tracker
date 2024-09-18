// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

function generateTaskId() {
  const id = nextId++;
  localStorage.setItem('nextId', JSON.stringify(nextId));
  return id;
}

function createTaskCard(task) {
  // Create card elements
  const taskCard = $('<div>')
    .addClass('card w-75 task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id)
    .on('click', handleDeleteTask);

  // Set card background color based on due date
  if (task.dueDate && task.status !== 'completed') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  // Append card elements
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

function renderTaskList() {
  const notStartedList = $('#notStartedTasks');
  const inProgressList = $('#inProgressTasks');
  const completedList = $('#completedTasks');

  notStartedList.empty();
  inProgressList.empty();
  completedList.empty();

  for (let task of taskList) {
    const taskCard = createTaskCard(task);
    if (task.status === 'not-started') {
      notStartedList.append(taskCard);
    } else if (task.status === 'in-progress') {
      inProgressList.append(taskCard);
    } else if (task.status === 'completed') {
      completedList.append(taskCard);
    }
  }

  // Make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({ maxWidth: original.outerWidth() });
    },
  });
}

function handleAddTask(event) {
  event.preventDefault();

  // Create a new task object
  const task = {
    id: generateTaskId(),
    title: $('#taskTitle').val(),
    description: $('#taskDescription').val(),
    dueDate: $('#taskDeadline').val(),
    status: 'not-started',
  };

  // Add the new task to the taskList
  taskList.push(task);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();

  // Clear form inputs
  $('#taskTitle').val('');
  $('#taskDescription').val('');
  $('#taskDeadline').val('');
}

function handleDeleteTask(event) {
  event.preventDefault();

  // Get the task id from the button clicked
  const taskId = $(this).attr('data-task-id');

  // Remove the task from the taskList and save
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

function handleDrop(event, ui) {
  // Get the task id and new status from the event
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  // Update the task status of the dragged card
  taskList = taskList.map(task => task.id === parseInt(taskId) ? { ...task, status: newStatus } : task);

  // Save and render
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

$(document).ready(function () {
  // Render the task list
  renderTaskList();

  // Add event listener for task form submission
  $('#taskForm').on('submit', handleAddTask);

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

  // Initialize datepicker for the deadline field
  $('#taskDeadline').datepicker({
    dateFormat: 'dd/mm/yy',
    changeMonth: true,
    changeYear: true,
  });
});