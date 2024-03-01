import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeProjectAction from './authorizeProjectAction';

const authorizeProjectActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      authorizeProjectAction(req.project.authUserMembership, action);
      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeProjectActionFlow;
