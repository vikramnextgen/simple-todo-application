// Simple Todo App JavaScript

// DOM Elements
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const tasksCount = document.getElementById('tasks-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filters = document.querySelectorAll('.filter');

// App State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    updateTasksCount();
});

// Event Listeners
addButton.addEventListener('click', addTodo);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filters.forEach(filter => {
    filter.addEventListener('click', () => {
        setFilter(filter.getAttribute('data-filter'));
    });
});

// Functions
function addTodo() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        // Add shake animation to input
        taskInput.classList.add('shake');
        setTimeout(() => taskInput.classList.remove('shake'), 500);
        return;
    }
    
    const newTodo = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date()
    };
    
    todos.unshift(newTodo);
    saveTodos();
    renderTodos();
    updateTasksCount();
    
    // Clear input
    taskInput.value = '';
    taskInput.focus();
}

function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    
    saveTodos();
    renderTodos();
    updateTasksCount();
}

function deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    
    // Add delete animation
    todoElement.classList.add('delete-animation');
    
    // Remove after animation completes
    todoElement.addEventListener('animationend', () => {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateTasksCount();
    });
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateTasksCount();
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter UI
    filters.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

function renderTodos() {
    // Filter todos based on current filter
    let filteredTodos = todos;
    
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }
    
    // Clear list
    todoList.innerHTML = '';
    
    // Show empty state if no todos
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-clipboard-list"></i>
            <p>${getEmptyStateMessage()}</p>
        `;
        todoList.appendChild(emptyState);
        return;
    }
    
    // Render todos
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoItem.setAttribute('data-id', todo.id);
        
        todoItem.innerHTML = `
            <input type="checkbox" class="todo-check" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHTML(todo.text)}</span>
            <button class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Add event listeners
        const checkbox = todoItem.querySelector('.todo-check');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        const deleteBtn = todoItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        todoList.appendChild(todoItem);
    });
}

function getEmptyStateMessage() {
    switch(currentFilter) {
        case 'active':
            return 'No active tasks. Good job!';
        case 'completed':
            return 'No completed tasks yet';
        default:
            return 'Add your first task above!';
    }
}

function updateTasksCount() {
    const activeTodos = todos.filter(todo => !todo.completed);
    tasksCount.textContent = `${activeTodos.length} task${activeTodos.length !== 1 ? 's' : ''} left`;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Helper function to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
}

// Add CSS for delete animation
const style = document.createElement('style');
style.textContent = `
    .todo-item.delete-animation {
        animation: slideOut 0.3s forwards;
    }
    
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    #task-input.shake {
        animation: shake 0.3s;
        border-color: #e74c3c !important;
    }
`;
document.head.appendChild(style);