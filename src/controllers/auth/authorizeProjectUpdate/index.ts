import { NextFunction, Response, Request } from 'express';
import authorizeProjectUpdate from './authorizeProjectUpdate';

const authorizeProjectUpdateFlow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authorizeProjectUpdate(req.user, req.project);
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

export default authorizeProjectUpdateFlow;
