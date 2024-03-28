import { Request, Response } from 'express';
import createStatusValidation from './createStatusValidation';
import createStatus from './createStatus';

interface CreateStatusRequestBody {
  name: unknown;
}

const createStatusFlow = async (
  req: Request<never, never, CreateStatusRequestBody>,
  res: Response,
) => {
  try {
    const project = req.project;
    const { name } = req.body;
    createStatusValidation(project.statuses, name);
    const statusData = await createStatus(project, name as string);
    return res.success('status has been successfully created', {
      status: statusData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default createStatusFlow;
