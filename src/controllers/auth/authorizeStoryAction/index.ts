import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeStoryCreate from './authorizeStoryCreate';
import authorizeStoryUpdate from './authorizeStoryUpdate';
import authorizeStoryRemove from './authorizeStoryRemove';

const authorizeStoryActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (action === AuthorizationAction.CREATE) {
        authorizeStoryCreate(req.project.authUserMembership);
        return next();
      }

      if (action === AuthorizationAction.UPDATE) {
        authorizeStoryUpdate(req.project.authUserMembership);
        return next();
      }

      if (action === AuthorizationAction.DELETE) {
        authorizeStoryRemove(req.project.authUserMembership);
        return next();
      }

      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeStoryActionFlow;
