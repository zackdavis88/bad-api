import { NextFunction, Response, Request } from 'express';
import authorizeProjectUpdate from './authorizeProjectUpdate';

const authorizeProjectUpdateFlow = (req: Request, res: Response, next: NextFunction) => {
  try {
    authorizeProjectUpdate(req.project);
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

export default authorizeProjectUpdateFlow;
