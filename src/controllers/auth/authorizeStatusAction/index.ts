import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeStatusCreate from './authorizeStatusCreate';
import authorizeStatusUpdate from './authorizeStatusUpdate';
import authorizeStatusRemove from './authorizeStatusRemove';

const authorizeStatusActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (action === AuthorizationAction.CREATE) {
        authorizeStatusCreate(req.project.authUserMembership);
        return next();
      }

      if (action === AuthorizationAction.UPDATE) {
        authorizeStatusUpdate(req.project.authUserMembership);
        return next();
      }

      if (action === AuthorizationAction.DELETE) {
        authorizeStatusRemove(req.project.authUserMembership);
        return next();
      }

      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeStatusActionFlow;
