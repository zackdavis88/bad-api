import { NextFunction, Response, Request } from 'express';
import authorizeProjectRemove from './authorizeProjectRemove';

const authorizeProjectRemoveFlow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authorizeProjectRemove(req.user, req.project);
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

export default authorizeProjectRemoveFlow;