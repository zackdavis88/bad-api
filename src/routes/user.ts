import { Router } from 'express';
import { AuthController, UserController } from 'src/controllers';

const configureUserRoutes = (router: Router) => {
  router
    .route('/users')
    .get(AuthController.authenticateToken, UserController.getAll)
    .post(UserController.create);

  router
    .route('/users/:username')
    .all(AuthController.authenticateToken)
    .get(UserController.getOne)
    .post(AuthController.authorizeUserUpdate, UserController.update)
    .delete(AuthController.authorizeUserUpdate, UserController.remove);
};

export default configureUserRoutes;
