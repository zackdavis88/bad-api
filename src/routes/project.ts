import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';

const configureUserRoutes = (router: Router) => {
  router
    .route('/projects')
    .all(AuthController.authenticateToken)
    .post(ProjectController.create);
};

export default configureUserRoutes;
