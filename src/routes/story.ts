import { Router } from 'express';
import { AuthController } from 'src/controllers';
import { AuthorizationAction } from 'src/server/types';

const configureStoryRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/stories')
    .all(AuthController.authenticateToken)
    .post()
    .get(AuthController.authorizeStoryAction(AuthorizationAction.CREATE));

  router
    .route('/projects/:projectId/stories/:storyId')
    .all(AuthController.authenticateToken)
    .post(AuthController.authorizeStoryAction(AuthorizationAction.UPDATE))
    .get()
    .delete(AuthController.authorizeStoryAction(AuthorizationAction.DELETE));
};

export default configureStoryRoutes;
