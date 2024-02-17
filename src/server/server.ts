import fs from 'fs';
import https from 'https';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import methodOverride from 'method-override';
import { PORT } from 'src/config/app';
import { initializeModelsAndSync } from 'src/models';
import { Sequelize } from 'sequelize';
import { DB_USERNAME, DB_PASSWORD, DB_HOSTNAME, DB_PORT, DB_NAME } from 'src/config/db';

const sequelize = new Sequelize(
  `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`,
  {
    logging: false,
  },
);

initializeModelsAndSync(sequelize).then(() => {
  const app = express();
  app.use(
    express.urlencoded({
      extended: true,
    }),
  );
  app.use(express.json());
  app.use(methodOverride());
  app.use(morgan('dev'));

  // Setup custom response handlers for the app.
  // app.use((_req, res, next) => {
  //   configureResponseHandlers(res);
  //   next();
  // });

  // All API routes.
  const apiRouter = express.Router();
  app.use(apiRouter);

  // Catch-all for routes that do not exist.
  // app.use('*', (_req, res) => {
  //   return res.notFoundError('API route not found');
  // });

  // Build an HTTP or HTTPS server depending on configs available.
  let server;
  const certExists = fs.existsSync('../config/ssl/cert.pem');
  const keyExists = fs.existsSync('../config/ssl/key.pem');
  const useHttps = certExists && keyExists;
  if (useHttps) {
    server = https.createServer(
      {
        key: fs.readFileSync('../config/ssl/key.pem'),
        cert: fs.readFileSync('../config/ssl/cert.pem'),
      },
      app,
    );
  } else {
    server = http.createServer(app);
  }

  server.listen(PORT, () => {
    console.log(
      'Bad JIRA listening on port %s using %s protocol',
      PORT,
      useHttps ? 'https' : 'http',
    );
  });
});
