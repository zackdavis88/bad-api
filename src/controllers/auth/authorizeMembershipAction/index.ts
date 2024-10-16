import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeMembershipCreate from './authorizeMembershipCreate';
import authorizeMembershipUpdate from './authorizeMembershipUpdate';
import authorizeMembershipRemove from './authorizeMembershipRemove';

const authorizeMembershipActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (action === AuthorizationAction.CREATE) {
        const isAdminRequired = req.body.isProjectAdmin === true;
        authorizeMembershipCreate(req.project.authUserMembership, isAdminRequired);
        return next();
      }

      if (action === AuthorizationAction.UPDATE) {
        authorizeMembershipUpdate(
          req.project.authUserMembership,
          req.membership.isProjectAdmin,
          req.body.isProjectAdmin,
        );
        return next();
      }

      if (action === AuthorizationAction.DELETE) {
        authorizeMembershipRemove(
          req.project.authUserMembership,
          req.membership.isProjectAdmin,
        );
        return next();
      }

      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeMembershipActionFlow;
