import express from 'express';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
} from '../controllers/todo.js';

const router = express.Router();

router.route('/')
  .get(getTodos)
  .post(createTodo);

router.route('/:id')
  .put(updateTodo)
  .delete(deleteTodo);

export default router;
