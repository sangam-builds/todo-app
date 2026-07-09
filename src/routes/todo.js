import express from 'express';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoHistory
} from '../controllers/todo.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getTodos)
  .post(createTodo);

router.route('/history')
  .get(requireAuth, getTodoHistory);

router.route('/:id')
  .put(updateTodo)
  .delete(deleteTodo);

export default router;
