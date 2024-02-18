import { Router } from 'express';
import { AuthController } from 'src/controllers';

const configureAuthRoutes = (router: Router) => {
  router.route('/auth').get(AuthController.generateToken);
};

export default configureAuthRoutes;
