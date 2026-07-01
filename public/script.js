document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const totalCountEl = document.getElementById('total-count');
    const completedCountEl = document.getElementById('completed-count');
    const pendingCountEl = document.getElementById('pending-count');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toastContainer = document.getElementById('toast-container');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Theme Management
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    let currentTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
        localStorage.setItem('theme', theme);
    }

    applyTheme(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    });

    let todos = [];
    let currentFilter = 'all';

    // Fetch todos on load
    async function fetchTodos() {
        try {
            const response = await fetch('/api/todos');
            if (!response.ok) throw new Error('Failed to load todos');
            todos = await response.json();
            render();
        } catch (error) {
            console.error(error);
            showToast('Error loading tasks from server', 'error');
        }
    }

    // Add new todo
    async function addTodo(title) {
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add task');
            }
            const newTodo = await response.json();
            todos.push(newTodo);
            render();
            showToast('Task added successfully');
        } catch (error) {
            console.error(error);
            showToast(error.message || 'Error adding task', 'error');
        }
    }

    // Toggle todo status
    async function toggleTodo(id, completed) {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
            if (!response.ok) throw new Error('Failed to update task');
            
            const updated = await response.json();
            todos = todos.map(t => t.id === id ? updated : t);
            render();
            showToast(completed ? 'Task completed' : 'Task marked pending');
        } catch (error) {
            console.error(error);
            showToast('Error updating task', 'error');
            // Re-fetch to sync UI state
            fetchTodos();
        }
    }

    // Delete a todo
    async function deleteTodo(id) {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete task');
            
            todos = todos.filter(t => t.id !== id);
            render();
            showToast('Task deleted successfully');
        } catch (error) {
            console.error(error);
            showToast('Error deleting task', 'error');
        }
    }

    // Render list and stats
    function render() {
        // Clear list
        todoList.innerHTML = '';

        // Filter todos
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'pending') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        // Update stats
        const totalCount = todos.length;
        const completedCount = todos.filter(t => t.completed).length;
        const pendingCount = totalCount - completedCount;

        totalCountEl.textContent = totalCount;
        completedCountEl.textContent = completedCount;
        pendingCountEl.textContent = pendingCount;

        // Toggle Empty State
        if (filteredTodos.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        // Generate items
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            li.innerHTML = `
                <div class="todo-item-left">
                    <label class="checkbox-container">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <span class="todo-text">${escapeHTML(todo.title)}</span>
                </div>
                <button class="delete-btn" aria-label="Delete task">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            `;

            // Event Listeners for Item
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                toggleTodo(todo.id, e.target.checked);
            });

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteTodo(todo.id);
            });

            todoList.appendChild(li);
        });
    }

    // Helper to escape HTML characters
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Show Toast Alert
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Form submission
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = todoInput.value.trim();
        if (title) {
            addTodo(title);
            todoInput.value = '';
        }
    });

    // Filter switching
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            render();
        });
    });

    // Initial load
    fetchTodos();
});
