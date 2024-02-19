import { Router } from 'express';
import { AuthController, UserController } from 'src/controllers';

const configureUserRoutes = (router: Router) => {
  router
    .route('/users')
    .get(AuthController.authenticateToken, UserController.getAll)
    .post(UserController.create);

  router
    .route('/users/:username')
    .get(AuthController.authenticateToken, UserController.getOne);
};

export default configureUserRoutes;
