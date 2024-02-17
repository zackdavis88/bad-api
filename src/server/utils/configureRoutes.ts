import express, { Express } from 'express';
import { configureCatchAllRoute } from 'src/routes';

const configureRoutes = (app: Express) => {
  const router = express.Router();
  configureCatchAllRoute(router);

  app.use(router);
};

export default configureRoutes;
