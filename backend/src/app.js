const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Two allowed origins: the customer-facing site and the internal admin app.
const allowedOrigins = [env.corsOrigin, env.adminCorsOrigin];
app.use(
  cors({
    origin(origin, callback) {
      // Allow no-origin requests (curl, server-to-server health checks).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      const err = new Error('Not allowed by CORS');
      err.status = 403;
      return callback(err);
    },
  })
);
app.use(express.json());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
