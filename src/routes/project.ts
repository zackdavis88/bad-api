import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';

const configureUserRoutes = (router: Router) => {
  router
    .route('/projects')
    .all(AuthController.authenticateToken)
    .get(ProjectController.getAll)
    .post(ProjectController.create);

  router
    .route('/projects/:projectId')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .get(ProjectController.getOne)
    .post(AuthController.authorizeProjectUpdate, ProjectController.update);
};

export default configureUserRoutes;
