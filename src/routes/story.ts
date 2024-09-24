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
    .get(
      AuthController.authorizeStoryAction(AuthorizationAction.READ),
      StoryController.getAll,
    );

  router
    .route('/projects/:projectId/stories/:storyId')
    .all(
      AuthController.authenticateToken,
      ProjectController.getProjectMiddleware,
      StoryController.getStoryMiddleware,
    )
    .post(
      AuthController.authorizeStoryAction(AuthorizationAction.UPDATE),
      StoryController.update,
    )
    .get(
      AuthController.authorizeStoryAction(AuthorizationAction.READ),
      StoryController.getOne,
    )
    .delete(
      AuthController.authorizeStoryAction(AuthorizationAction.DELETE),
      StoryController.remove,
    );
};

export default configureStoryRoutes;
