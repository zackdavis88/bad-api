import { Router } from 'express';
import { AuthController, StoryController, ProjectController } from 'src/controllers';
import { AuthorizationAction } from 'src/server/types';

const configureStoryRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/stories')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .post(
      AuthController.authorizeStoryAction(AuthorizationAction.CREATE),
      StoryController.create,
    )
    .get();

  router
    .route('/projects/:projectId/stories/:storyId')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .post(AuthController.authorizeStoryAction(AuthorizationAction.UPDATE))
    .get()
    .delete(AuthController.authorizeStoryAction(AuthorizationAction.DELETE));
};

export default configureStoryRoutes;
