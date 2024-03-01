import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeUserUpdateOrRemove from './authorizeUserUpdateOrRemove';

const authorizeUserActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (
        action === AuthorizationAction.UPDATE ||
        action === AuthorizationAction.DELETE
      ) {
        authorizeUserUpdateOrRemove(req.user.username, req.params.username);
      }

      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeUserActionFlow;
