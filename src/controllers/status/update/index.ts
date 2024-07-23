import { Request, Response } from 'express';
import updateStatusValidation from './updateStatusValidation';
import updateStatus from './updateStatus';

interface UpdateStatusRequestBody {
  name: unknown;
}

const updateStatusFlow = async (
  req: Request<never, never, UpdateStatusRequestBody>,
  res: Response,
) => {
  try {
    const { project, status } = req;
    const { name } = req.body;
    await updateStatusValidation(project, name);
    const statusData = await updateStatus(project, status, name as string);
    return res.success('status has been successfully updated', {
      status: statusData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default updateStatusFlow;
