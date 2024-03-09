import { Router } from 'express';
import { AuthController, UserController } from 'src/controllers';
import { AuthorizationAction } from 'src/server/types';

const configureUserRoutes = (router: Router) => {
  router
    .route('/users')
    .get(AuthController.authenticateToken, UserController.getAll)
    .post(UserController.create);

  router
    .route('/users/:username')
    .all(AuthController.authenticateToken)
    .get(UserController.getOne)
    .post(
      AuthController.authorizeUserAction(AuthorizationAction.UPDATE),
      UserController.update,
    )
    .delete(
      AuthController.authorizeUserAction(AuthorizationAction.DELETE),
      UserController.remove,
    );
};

export default configureUserRoutes;
