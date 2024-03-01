import { Router } from 'express';
import { AuthController, ProjectController, MembershipController } from 'src/controllers';
import { AuthorizationAction } from 'src/server/types';
const configureMembershipRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/memberships')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .get(MembershipController.getAll)
    .post(
      AuthController.authorizeMembershipAction(AuthorizationAction.CREATE),
      MembershipController.create,
    );

  router
    .route('/projects/:projectId/memberships/:membershipId')
    .all(AuthController.authenticateToken, ProjectController.getProjectMiddleware)
    .get(MembershipController.getOne)
    .post()
    .delete();
};

export default configureMembershipRoutes;
