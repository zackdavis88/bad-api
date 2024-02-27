import { NextFunction, Request, Response } from 'express';
import authorizeMembershipCreate from './authorizeMembershipCreate';

const authorizeMembershipCreateFlow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminPrivilegeRequired = !!req.body.isProjectAdmin;
    authorizeMembershipCreate(req.project, adminPrivilegeRequired);
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

export default authorizeMembershipCreateFlow;
