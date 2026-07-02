import './config/env.js'; // Must be first to load environment variables before other imports
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Await database connection before listening
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use by another process.`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
