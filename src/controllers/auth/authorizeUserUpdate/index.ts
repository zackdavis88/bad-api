import { NextFunction, Request, Response } from 'express';
import authorizeUserUpdate from './authorizeUserUpdate';

const authorizeUserUpdateFlow = (req: Request, res: Response, next: NextFunction) => {
  try {
    authorizeUserUpdate(req.user.username, req.params.username);
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

export default authorizeUserUpdateFlow;
