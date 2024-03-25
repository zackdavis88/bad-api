import { Router } from 'express';
import { AuthController, ProjectController, StatusController } from 'src/controllers';

const configureStatusRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/statuses')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .get(StatusController.getAll);
};

export default configureStatusRoutes;
