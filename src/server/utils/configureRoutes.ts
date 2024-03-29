import express, { Express } from 'express';
import {
  configureCatchAllRoute,
  configureAuthRoutes,
  configureUserRoutes,
} from 'src/routes';

const configureRoutes = (app: Express) => {
  const router = express.Router();

  configureAuthRoutes(router);
  configureUserRoutes(router);
  configureCatchAllRoute(router); // This catch-all route must always be last.

  app.use(router);
};

export default configureRoutes;
