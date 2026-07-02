import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import todoRouter from './routes/todo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/todos', todoRouter);

export default app;
