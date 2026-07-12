import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { parseUser } from './middlewares/auth.js';
import todoRouter from './routes/todo.js';
import authRouter from './routes/auth.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(parseUser); // Parse authentication JWT cookie
app.use(express.static(path.join(__dirname, '../public')));

// Serve Dashboard
app.get('/app', (req, res, next) => {
  const filePath = path.join(__dirname, '../public/app.html');
  console.log(`[DEBUG] Serving /app. __dirname: ${__dirname}, filePath: ${filePath}, exists: ${fs.existsSync(filePath)}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('[DEBUG] res.sendFile error:', err);
      if (!res.headersSent) {
        res.status(err.status || 500).send(err.message);
      }
    } else {
      console.log('[DEBUG] res.sendFile succeeded');
    }
  });
});

// API Routes
app.use('/api/todos', todoRouter);
app.use('/api/auth', authRouter);

export default app;
