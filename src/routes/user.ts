import { Router } from 'express';
import { UserController } from 'src/controllers';

const configureUserRoutes = (router: Router) => {
  router.route('/users').post(UserController.create);
};

export default configureUserRoutes;
