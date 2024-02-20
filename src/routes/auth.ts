import { Router } from 'express';
import { AuthController } from 'src/controllers';

const configureAuthRoutes = (router: Router) => {
  router.route('/auth').get(AuthController.generateToken);

  router
    .route('/auth/token')
    .get(AuthController.authenticateToken, AuthController.getAuthenticationDetails);
};

export default configureAuthRoutes;
