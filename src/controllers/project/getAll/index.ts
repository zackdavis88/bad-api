import { Request, Response } from 'express';
import getAllProjectsValiation from './getAllProjectsValidation';
import getAllProjects from './getAllProjects';

const getAllProjectsFlow = async (req: Request, res: Response) => {
  try {
    const paginationData = await getAllProjectsValiation(req.query);
    const projects = await getAllProjects(paginationData);

    return res.success('project list has been successfully retrieved', {
      page: paginationData.page,
      totalItems: paginationData.totalItems,
      totalPages: paginationData.totalPages,
      itemsPerPage: paginationData.itemsPerPage,
      projects,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default getAllProjectsFlow;
