import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (from project root)
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(__dirname, '..', '..', envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Environment configuration loaded from ${envFile}`);
} else {
  dotenv.config();
  console.log('Environment configuration loaded from default environment');
}
