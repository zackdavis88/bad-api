import { Request, Response } from 'express';
import removeStatusValidation from './removeStatusValidation';
import removeStatus from './removeStatus';

interface RemoveStatusRequestBody {
  confirm: unknown;
}

const removeStatusFlow = async (
  req: Request<never, never, RemoveStatusRequestBody>,
  res: Response,
) => {
  try {
    const { project, status } = req;
    const { confirm } = req.body;
    removeStatusValidation(confirm);
    const statusData = await removeStatus(project, status);
    return res.success('status has been successfully removed', {
      status: statusData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default removeStatusFlow;
