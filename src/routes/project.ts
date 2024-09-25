import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';
import { AuthorizationAction } from 'src/server/types';

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
    .post(
      AuthController.authorizeProjectAction(AuthorizationAction.UPDATE),
      ProjectController.update,
    )
    .delete(
      AuthController.authorizeProjectAction(AuthorizationAction.DELETE),
      ProjectController.remove,
    );

  router
    .route('/projects/:projectId/permissions')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .get(AuthController.getProjectPermissions);
};

export default configureProjectRoutes;
