import { Request, Response, NextFunction } from 'express';
import getOneStatusValidation from './getOneStatusValidation';
import getOneStatus from './getOneStatus';

export const getStatusMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = req.project;
    getOneStatusValidation(req.params.statusId);
    const status = await getOneStatus(project, req.params.statusId);
    req.status = status;
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

const getOneStatusFlow = async (req: Request, res: Response) => {
  const project = req.project;
  const status = req.status;

  const statusData = {
    id: status.id,
    name: status.name,
    project: {
      id: project.id,
      name: project.name,
    },
  };

  return res.success('status has been successfully retrieved', {
    status: statusData,
  });
};

export default getOneStatusFlow;
