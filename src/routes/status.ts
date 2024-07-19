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

  router
    .route('/projects/:projectId/statuses/:statusId')
    .all(
      AuthController.authenticateToken,
      ProjectController.getProjectMiddleware,
      StatusController.getStatusMiddleware,
    )
    .get(StatusController.getOne);
};

export default configureStatusRoutes;
