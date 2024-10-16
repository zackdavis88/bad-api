import { Router } from 'express';
import { AuthController, DashboardController } from 'src/controllers';

const configureDashboardRoutes = (router: Router) => {
  router
    .route('/dashboard/projects')
    .all(AuthController.authenticateToken)
    .get(DashboardController.getUserProjects);
};

export default configureDashboardRoutes;
