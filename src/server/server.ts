import fs from 'fs';
import https, { Server as HttpsServer } from 'https';
import http, { Server as HttpServer } from 'http';
import express from 'express';
import morgan from 'morgan';
import methodOverride from 'method-override';
import { PORT } from 'src/config/app';
import {
  configureResponseHandlers,
  configureRoutes,
  initializeDatabaseConnection,
} from './utils';
import { User, Project, Membership, Status } from 'src/models';

// Extend the types availble on the Express request/response objects.
declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    interface Request {
      user: User;
      project: Project;
      membership: Membership;
      status: Status;
    }
    interface Response {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      success: (message: string, data?: any) => Response | undefined;
      sendError: (error: unknown) => Response | undefined;
    }
  }
}

// Connect to the database before starting the server.
initializeDatabaseConnection().then(() => {
  // Create and configure an express app.
  const app = express();
  app.use(
    express.urlencoded({
      extended: true,
    }),
  );
  app.use(express.json());
  app.use(methodOverride());
  app.use(morgan('dev'));

  // Configure custom response handlers for the app.
  app.use(configureResponseHandlers);

  // Configure all API routes.
  configureRoutes(app);

  // Create a HTTP or HTTPS server depending on configs available.
  let server: HttpsServer | HttpServer;
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

  // Start the server.
  server.listen(PORT, () => {
    console.log(
      'Bad API listening on port %s using %s protocol',
      PORT,
      useHttps ? 'https' : 'http',
    );
  });
});
