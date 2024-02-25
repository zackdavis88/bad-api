import { NextFunction, Response, Request } from 'express';
import authorizeProjectRemove from './authorizeProjectRemove';

const authorizeProjectRemoveFlow = (req: Request, res: Response, next: NextFunction) => {
  try {
    authorizeProjectRemove(req.project);
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

export default authorizeProjectRemoveFlow;
