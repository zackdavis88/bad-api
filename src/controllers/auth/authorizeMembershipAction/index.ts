import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeMembershipAction from './authorizeMembershipAction';

const authorizeMembershipActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      authorizeMembershipAction(
        req.project.authUserMembership,
        req.body.isProjectAdmin,
        action,
      );
      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeMembershipActionFlow;
