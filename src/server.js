const app = require('./app');
const PORT = process.env.PORT || 3000;

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
