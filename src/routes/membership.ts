import { Router } from 'express';
import { AuthController, ProjectController, MembershipController } from 'src/controllers';

const configureMembershipRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/memberships')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .post(AuthController.authorizeMembershipCreate, MembershipController.create);
};

export default configureMembershipRoutes;
