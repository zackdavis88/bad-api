import { Request, Response } from 'express';
import getAllStatuses from './getAllStatuses';

const getAllStatusesFlow = async (req: Request, res: Response) => {
  try {
    const project = req.project;
    const statuses = await getAllStatuses(project);

    return res.success('status list has been successfully retrieved', {
      project: {
        id: project.id,
        name: project.name,
      },
      statuses,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default getAllStatusesFlow;
