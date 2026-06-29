let todos = [];
let nextId = 1;

module.exports = {
  getAll: () => todos,
  getById: (id) => todos.find(t => t.id === id),
  add: (title) => {
    const todo = { id: nextId++, title, completed: false, createdAt: new Date() };
    todos.push(todo);
    return todo;
  },
  update: (id, updates) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      if (updates.title !== undefined) todo.title = updates.title;
      if (updates.completed !== undefined) todo.completed = updates.completed;
      return todo;
    }
    return null;
  },
  delete: (id) => {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
      return todos.splice(index, 1)[0];
    }
    return null;
  }
};
