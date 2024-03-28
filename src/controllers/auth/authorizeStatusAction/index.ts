import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeStatusCreate from './authorizeStatusCreate';

const authorizeStatusActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (action === AuthorizationAction.CREATE) {
        authorizeStatusCreate(req.project.authUserMembership);
        return next();
      }

      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeStatusActionFlow;
