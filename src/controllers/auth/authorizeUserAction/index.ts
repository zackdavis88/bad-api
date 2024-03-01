import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeUserAction from './authorizeUserAction';

const authorizeUserActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      authorizeUserAction(req.user.username, req.params.username, action);
      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeUserActionFlow;
