import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';

const configureProjectRoutes = (router: Router) => {
  router
    .route('/projects')
    .all(AuthController.authenticateToken)
    .get(ProjectController.getAll)
    .post(ProjectController.create);

  router
    .route('/projects/:projectId')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .get(ProjectController.getOne)
    .post(AuthController.authorizeProjectUpdate, ProjectController.update)
    .delete(AuthController.authorizeProjectRemove, ProjectController.remove);
};

export default configureProjectRoutes;
