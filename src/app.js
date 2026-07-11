import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { parseUser } from './middlewares/auth.js';
import todoRouter from './routes/todo.js';
import authRouter from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(parseUser); // Parse authentication JWT cookie
app.use(express.static(path.join(__dirname, '../public')));

// Serve Dashboard
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/app.html'));
});

// API Routes
app.use('/api/todos', todoRouter);
app.use('/api/auth', authRouter);

export default app;
