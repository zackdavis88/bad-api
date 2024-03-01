import { NextFunction, Request, Response } from 'express';
import { AuthorizationAction } from 'src/server/types';
import authorizeMembershipCreate from './authorizeMembershipCreate';

const authorizeMembershipActionFlow = (action: AuthorizationAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (action === AuthorizationAction.CREATE) {
        const isAdminRequired = req.body.isProjectAdmin === true;
        authorizeMembershipCreate(req.project.authUserMembership, isAdminRequired);
        return next();
      }

      // TODO: More action handling here for UPDATE and DELETE
      next();
    } catch (error) {
      return res.sendError(error);
    }
  };
};

export default authorizeMembershipActionFlow;
