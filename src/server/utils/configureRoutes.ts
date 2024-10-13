import express, { Express } from 'express';
import {
  configureCatchAllRoute,
  configureAuthRoutes,
  configureUserRoutes,
  configureProjectRoutes,
  configureMembershipRoutes,
  configureStatusRoutes,
  configureStoryRoutes,
} from 'src/routes';

const configureRoutes = (app: Express) => {
  const router = express.Router();

  configureAuthRoutes(router);
  configureUserRoutes(router);
  configureProjectRoutes(router);
  configureMembershipRoutes(router);
  configureStatusRoutes(router);
  configureStoryRoutes(router);
  configureCatchAllRoute(router); // This catch-all route must always be last.

  app.use(router);
};

export default configureRoutes;
