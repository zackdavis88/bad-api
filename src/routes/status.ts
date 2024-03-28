import { Router } from 'express';
import { AuthController, ProjectController, StatusController } from 'src/controllers';
import { AuthorizationAction } from 'src/server/types';

const configureStatusRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/statuses')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .post(
      AuthController.authorizeStatusAction(AuthorizationAction.CREATE),
      StatusController.create,
    )
    .get(StatusController.getAll);
};

export default configureStatusRoutes;
