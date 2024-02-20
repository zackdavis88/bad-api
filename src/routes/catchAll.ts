import { Router, Request, Response } from 'express';
import { NotFoundError } from 'src/server/utils/errors';

// Catch-all route that returns 404 if a requested route does not exist.
const catchAllRoute = (_req: Request, res: Response) => {
  const routeNotFoundError = new NotFoundError('API route not found');
  return res.sendError(routeNotFoundError);
};

const configureCatchAllRoute = (router: Router) => {
  router.route('*').all(catchAllRoute);
};

export default configureCatchAllRoute;
