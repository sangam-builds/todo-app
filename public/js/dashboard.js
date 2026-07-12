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

    const googleSyncBtn = document.getElementById('google-sync');
    const userProfileEl = document.getElementById('user-profile');
    const userAvatarEl = document.getElementById('user-avatar');
    const userNameEl = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');

    // Modal Elements
    const signupModal = document.getElementById('signup-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const googleSignupBtn = document.getElementById('google-signup-btn');

    // History Elements
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryModalBtn = document.getElementById('close-history-modal');
    const historyList = document.getElementById('history-list');
    const historyEmptyState = document.getElementById('history-empty-state');

    // Multi-Pane Navigation Elements
    const appContainer = document.querySelector('.app-container');
    const dashNavButtons = document.querySelectorAll('.dash-nav-btn');
    const dashboardPanes = document.querySelectorAll('.dashboard-pane');

    // Kanban Columns & Badges
    const kanbanBacklogCards = document.getElementById('kanban-backlog-cards');
    const kanbanProgressCards = document.getElementById('kanban-progress-cards');
    const kanbanCompletedCards = document.getElementById('kanban-completed-cards');
    const kanbanBacklogCount = document.getElementById('kanban-backlog-count');
    const kanbanProgressCount = document.getElementById('kanban-progress-count');
    const kanbanCompletedCount = document.getElementById('kanban-completed-count');

    // Analytics / Statistics Elements
    const dashboardBarChart = document.getElementById('dashboard-bar-chart');
    const dashboardProgressRing = document.getElementById('dashboard-progress-ring');
    const dashboardProgressPercent = document.getElementById('dashboard-progress-percent');

    // Activity Timeline Elements
    const dashboardTimeline = document.getElementById('dashboard-timeline');

    // Detailed Task Modal Elements
    const taskModal = document.getElementById('task-modal');
    const closeTaskModalBtn = document.getElementById('close-task-modal');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const detailedTaskForm = document.getElementById('detailed-task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskAddCalendarCheckbox = document.getElementById('task-add-calendar');

    function openTaskModal() {
        if (!isAuthenticated) {
            openSignupModal();
            return;
        }
        taskTitleInput.value = todoInput.value.trim();
        taskModal.classList.remove('hidden');
    }

    function closeTaskModal() {
        taskModal.classList.add('hidden');
        detailedTaskForm.reset();
        todoInput.value = '';
    }

    closeTaskModalBtn.addEventListener('click', closeTaskModal);
    cancelTaskBtn.addEventListener('click', closeTaskModal);

    // Bind tab switching events
    dashNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPaneId = btn.dataset.pane;
            
            // Toggle active styling on nav buttons
            dashNavButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch visibility of dashboard panes
            dashboardPanes.forEach(pane => {
                if (pane.id === targetPaneId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            // Adjust width of app container based on active pane
            if (targetPaneId === 'pane-todo') {
                appContainer.classList.remove('wide');
            } else {
                appContainer.classList.add('wide');
            }
        });
    });

    let isAuthenticated = false;
    let supabase;
    let session = null;

    // Fetch config and bootstrap Supabase client
    const initPromise = fetch('/api/auth/config')
        .then(res => res.json())
        .then(config => {
            supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
            
            // Listen to auth changes and sync tokens to cookies
            supabase.auth.onAuthStateChange((event, sessionData) => {
                if (sessionData) {
                    document.cookie = `sb-access-token=${sessionData.access_token}; path=/; max-age=${sessionData.expires_in}; SameSite=Lax; secure`;
                    session = sessionData;
                    isAuthenticated = true;
                } else {
                    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
                    session = null;
                    isAuthenticated = false;
                }
            });
            return supabase;
        })
        .catch(err => {
            console.error('Failed to initialize Supabase client:', err);
        });

    // Helper wrapper for API fetches that attaches Supabase auth token
    async function fetchAPI(url, options = {}) {
        await initPromise;
        if (!session) {
            const { data } = await supabase.auth.getSession();
            session = data.session;
        }
        
        const headers = options.headers || {};
        if (session) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
            if (session.provider_token) {
                headers['X-Google-Provider-Token'] = session.provider_token;
            }
        }
        
        return fetch(url, {
            ...options,
            headers
        });
    }

    function openSignupModal() {
        signupModal.classList.remove('hidden');
    }

    function closeSignupModal() {
        signupModal.classList.add('hidden');
    }

    closeModalBtn.addEventListener('click', closeSignupModal);
    signupModal.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            closeSignupModal();
        }
    });

    function openHistoryModal() {
        historyModal.classList.remove('hidden');
        fetchHistory();
    }

    function closeHistoryModal() {
        historyModal.classList.add('hidden');
    }

    historyBtn.addEventListener('click', openHistoryModal);
    closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            closeHistoryModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!signupModal.classList.contains('hidden')) {
                closeSignupModal();
            }
            if (!historyModal.classList.contains('hidden')) {
                closeHistoryModal();
            }
        }
    });

    googleSignupBtn.addEventListener('click', async () => {
        try {
            await initPromise;
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/app',
                    scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });
        } catch (error) {
            console.error('Google OAuth trigger failed:', error);
            showToast('Failed to start Google authentication', 'error');
        }
    });

    // Redirect to Google login flow
    googleSyncBtn.addEventListener('click', async () => {
        try {
            await initPromise;
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/app',
                    scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });
        } catch (error) {
            console.error('Google OAuth trigger failed:', error);
            showToast('Failed to start Google authentication', 'error');
        }
    });

    // Handle logout action
    logoutBtn.addEventListener('click', async () => {
        try {
            await initPromise;
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            showToast('Successfully logged out');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
            showToast('Error during logout', 'error');
        }
    });

    // Session status validation
    async function checkSession() {
        try {
            await initPromise;
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (currentSession) {
                session = currentSession;
                googleSyncBtn.classList.add('hidden');
                userProfileEl.classList.remove('hidden');
                const user = currentSession.user;
                userNameEl.textContent = `Hi, ${(user.user_metadata?.name || user.email).split(' ')[0]}`;
                userAvatarEl.src = user.user_metadata?.avatar_url || 'https://lh3.googleusercontent.com/a/default-user=s80-c';
                userAvatarEl.style.display = 'block';
                isAuthenticated = true;
            } else {
                googleSyncBtn.classList.remove('hidden');
                userProfileEl.classList.add('hidden');
                isAuthenticated = false;
                window.location.href = '/'; // Strict security redirect to landing page
            }
        } catch (error) {
            console.error('Session check failed:', error);
            isAuthenticated = false;
            window.location.href = '/';
        }
    }

    let todos = [];
    let currentFilter = 'all';

    // Fetch todos on load
    async function fetchTodos() {
        try {
            const response = await fetchAPI('/api/todos');
            if (!response.ok) throw new Error('Failed to load todos');
            todos = await response.json();
            render();
        } catch (error) {
            console.error(error);
            showToast('Error loading tasks from server', 'error');
        }
    }

    // Add new todo
    async function addTodo(title, deadline = null, priority = 'MEDIUM', addToCalendar = false) {
        try {
            const response = await fetchAPI('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, deadline, priority, addToCalendar })
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
            const response = await fetchAPI(`/api/todos/${id}`, {
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
            fetchTodos();
        }
    }

    // Delete a todo
    async function deleteTodo(id) {
        try {
            const response = await fetchAPI(`/api/todos/${id}`, {
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

            const priorityClass = (todo.priority || 'MEDIUM').toLowerCase();
            const priorityLabel = priorityClass.charAt(0).toUpperCase() + priorityClass.slice(1);
            
            let deadlineHTML = '';
            if (todo.deadline) {
                const deadlineDate = new Date(todo.deadline);
                const formattedDeadline = deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                deadlineHTML = `
                    <div class="todo-item-deadline">
                        <i class="fa-regular fa-calendar-times"></i>
                        <span>Due: ${formattedDeadline}</span>
                    </div>
                `;
            }

            li.innerHTML = `
                <div class="todo-item-left">
                    <label class="checkbox-container">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <div class="todo-item-details" style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                        <span class="todo-text">${escapeHTML(todo.title)}</span>
                        ${deadlineHTML}
                    </div>
                </div>
                <div class="todo-item-right" style="display: flex; align-items: center; gap: 12px;">
                    <span class="priority-badge-tag ${priorityClass}">${priorityLabel}</span>
                    <button class="delete-btn" aria-label="Delete task">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
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

        // Trigger updates across other views
        renderKanban();
        renderStats();
        renderTimeline();
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

    // Populate Kanban board dynamically
    function renderKanban() {
        if (!kanbanBacklogCards || !kanbanProgressCards || !kanbanCompletedCards) return;

        kanbanBacklogCards.innerHTML = '';
        kanbanProgressCards.innerHTML = '';
        kanbanCompletedCards.innerHTML = '';

        const backlogList = [];
        const progressList = [];
        const completedList = [];

        todos.forEach((todo, index) => {
            if (todo.completed) {
                completedList.push(todo);
            } else if (index % 2 === 0) {
                backlogList.push(todo);
            } else {
                progressList.push(todo);
            }
        });

        kanbanBacklogCount.textContent = backlogList.length;
        kanbanProgressCount.textContent = progressList.length;
        kanbanCompletedCount.textContent = completedList.length;

        const createCardElement = (todo) => {
            const card = document.createElement('div');
            card.className = 'kanban-card';

            const priorityClass = (todo.priority || 'MEDIUM').toLowerCase();
            const priorityLabel = priorityClass.charAt(0).toUpperCase() + priorityClass.slice(1);
            
            let deadlineHTML = '';
            if (todo.deadline) {
                const deadlineDate = new Date(todo.deadline);
                const formattedDeadline = deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                deadlineHTML = `
                    <div class="kanban-card-deadline">
                        <i class="fa-regular fa-calendar-times"></i>
                        <span>Due: ${formattedDeadline}</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="kanban-card-title">${escapeHTML(todo.title)}</div>
                ${deadlineHTML}
                <div class="kanban-card-actions">
                    <span class="priority-badge-tag ${priorityClass}">${priorityLabel}</span>
                    <div class="actions-right">
                        <button class="toggle-btn" aria-label="Toggle task" title="Toggle status">
                            <i class="fa-solid ${todo.completed ? 'fa-circle-check' : 'fa-circle'}"></i>
                        </button>
                        <button class="delete-btn" aria-label="Delete task" title="Delete task">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;

            card.querySelector('.toggle-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTodo(todo.id, !todo.completed);
            });

            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
            });

            return card;
        };

        backlogList.forEach(todo => kanbanBacklogCards.appendChild(createCardElement(todo)));
        progressList.forEach(todo => kanbanProgressCards.appendChild(createCardElement(todo)));
        completedList.forEach(todo => kanbanCompletedCards.appendChild(createCardElement(todo)));
    }

    // Populate Analytics & Productivity Charts dynamically
    function renderStats() {
        if (!dashboardBarChart || !dashboardProgressRing || !dashboardProgressPercent) return;

        const totalCount = todos.length;
        const completedCount = todos.filter(t => t.completed).length;
        const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

        const offset = 314 - (314 * pct) / 100;
        dashboardProgressRing.style.strokeDashoffset = offset;
        dashboardProgressPercent.textContent = pct + '%';

        // Base/Mock completions per day to ensure visually rich aesthetic
        const weekdayCounts = { Mon: 2, Tue: 3, Wed: 5, Thu: 4, Fri: 6 };

        // Add user's actual tasks completed to chart
        todos.forEach(todo => {
            if (todo.completed && todo.completedAt) {
                const date = new Date(todo.completedAt);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                if (weekdayCounts[dayName] !== undefined) {
                    weekdayCounts[dayName]++;
                }
            }
        });

        dashboardBarChart.innerHTML = '';
        const maxCompletions = Math.max(...Object.values(weekdayCounts), 1);

        Object.keys(weekdayCounts).forEach(day => {
            const count = weekdayCounts[day];
            const heightPx = Math.max(12, Math.round((count / maxCompletions) * 150));

            const barWrapper = document.createElement('div');
            barWrapper.className = 'chart-bar-wrapper';
            barWrapper.innerHTML = `
                <div class="chart-bar" style="height: ${heightPx}px;" title="${count} tasks completed"></div>
                <span class="chart-bar-label">${day}</span>
            `;
            dashboardBarChart.appendChild(barWrapper);
        });
    }

    // Populate Activity Timeline dynamically
    function renderTimeline() {
        if (!dashboardTimeline) return;

        dashboardTimeline.innerHTML = '';
        const timelineEvents = [];

        todos.forEach(todo => {
            if (todo.createdAt) {
                const createdTime = new Date(todo.createdAt);
                timelineEvents.push({
                    title: 'Task Created',
                    desc: `Task "${todo.title}" was added to backlog.`,
                    time: createdTime,
                    timeString: createdTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }

            if (todo.completed && todo.completedAt) {
                const completedTime = new Date(todo.completedAt);
                timelineEvents.push({
                    title: 'Task Completed',
                    desc: `Task "${todo.title}" was marked as completed.`,
                    time: completedTime,
                    timeString: completedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        });

        timelineEvents.sort((a, b) => b.time - a.time);

        if (timelineEvents.length === 0) {
            dashboardTimeline.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                    <i class="fa-solid fa-timeline" style="font-size: 2rem; opacity: 0.3; margin-bottom: 12px; display: block;"></i>
                    <p>No recent activity. Try adding or completing a task!</p>
                </div>
            `;
            return;
        }

        timelineEvents.slice(0, 8).forEach(ev => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <span class="timeline-time">${ev.timeString}</span>
                <div class="timeline-content-card">
                    <div class="timeline-title">${escapeHTML(ev.title)}</div>
                    <p class="timeline-desc">${escapeHTML(ev.desc)}</p>
                </div>
            `;
            dashboardTimeline.appendChild(item);
        });
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

    // Form submission (intercepted to open detailed task popup)
    todoInput.addEventListener('click', (e) => {
        e.preventDefault();
        openTaskModal();
    });

    todoInput.addEventListener('focus', (e) => {
        e.preventDefault();
        todoInput.blur();
        openTaskModal();
    });

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        openTaskModal();
    });

    // Detailed Task Modal form submission
    detailedTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            closeTaskModal();
            openSignupModal();
            return;
        }

        const title = taskTitleInput.value.trim();
        const deadline = taskDeadlineInput.value ? new Date(taskDeadlineInput.value).toISOString() : null;
        
        // Retrieve checked priority level from radio elements
        const selectedPriorityEl = detailedTaskForm.querySelector('input[name="task-priority"]:checked');
        const priority = selectedPriorityEl ? selectedPriorityEl.value : 'MEDIUM';
        
        const addToCalendar = taskAddCalendarCheckbox.checked;

        if (title) {
            addTodo(title, deadline, priority, addToCalendar);
            closeTaskModal();
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

    // Fetch history from API
    async function fetchHistory() {
        try {
            historyList.innerHTML = '<li style="text-align: center; padding: 20px; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> Loading history...</li>';
            historyEmptyState.classList.add('hidden');
            
            const response = await fetchAPI('/api/todos/history');
            if (!response.ok) throw new Error('Failed to load history');
            
            const historyItems = await response.json();
            renderHistory(historyItems);
        } catch (error) {
            console.error(error);
            showToast('Error loading history from server', 'error');
            historyList.innerHTML = '';
            historyEmptyState.classList.remove('hidden');
        }
    }

    // Render history items
    function renderHistory(items) {
        historyList.innerHTML = '';
        
        if (!items || items.length === 0) {
            historyEmptyState.classList.remove('hidden');
            return;
        }
        
        historyEmptyState.classList.add('hidden');
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            let statusLabel = 'Pending';
            let statusClass = 'status-pending';
            
            if (item.deleted) {
                statusLabel = 'Deleted';
                statusClass = 'status-deleted';
            } else if (item.completed) {
                statusLabel = 'Completed';
                statusClass = 'status-completed';
            }
            
            li.innerHTML = `
                <div class="history-item-top">
                    <span class="history-title">${escapeHTML(item.title)}</span>
                    <span class="history-status ${statusClass}">${statusLabel}</span>
                </div>
                <div class="history-dates">
                    <div class="history-date-item">
                        <i class="fa-regular fa-calendar-plus"></i>
                        <span class="history-date-label">Created:</span>
                        <span class="history-date-val">${formatDateTime(item.createdAt)}</span>
                    </div>
                    ${item.completed ? `
                    <div class="history-date-item">
                        <i class="fa-regular fa-calendar-check"></i>
                        <span class="history-date-label">Completed:</span>
                        <span class="history-date-val">${formatDateTime(item.completedAt)}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            historyList.appendChild(li);
        });
    }

    // Format timestamps to local readable text
    function formatDateTime(dateStr) {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    }

    // Initial load
    async function init() {
        await checkSession();
        fetchTodos();
    }
    init();
});

