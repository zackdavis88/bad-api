import { Request, Response } from 'express';
import getAllStatuses from './getAllStatuses';
import getAllStatusesValiation from './getAllStatusesValidation';

const getAllStatusesFlow = async (req: Request, res: Response) => {
  try {
    const project = req.project;
    const paginationData = await getAllStatusesValiation(project, req.query);
    const statuses = await getAllStatuses(project, paginationData);

    return res.success('status list has been successfully retrieved', {
      page: paginationData.page,
      totalItems: paginationData.totalItems,
      totalPages: paginationData.totalPages,
      itemsPerPage: paginationData.itemsPerPage,
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
