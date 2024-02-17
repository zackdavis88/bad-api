import { Router, Request, Response } from 'express';

// Catch-all route that returns 404 if a requested route does not exist.
const catchAllRoute = (_req: Request, res: Response) => {
  return res.notFoundError('API route not found');
};

const configureCatchAllRoute = (router: Router) => {
  router.route('*').all(catchAllRoute);
};

export default configureCatchAllRoute;
