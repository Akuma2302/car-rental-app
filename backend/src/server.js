const app = require('./app');
const env = require('./config/env');
const migrate = require('./config/migrate');

async function start() {
  await migrate();
  app.listen(env.port, () => {
    console.log(`Car rental API running on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
