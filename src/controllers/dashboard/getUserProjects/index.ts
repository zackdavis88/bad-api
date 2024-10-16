import { Request, Response } from 'express';
import getUserProjectsValidation from './getUserProjectsValidation';
import getUserProjects from './getUserProjects';

const getUserProjectsFlow = async (req: Request, res: Response) => {
  const user = req.user;
  const paginationData = await getUserProjectsValidation(user, req.query);
  const projects = await getUserProjects(user, paginationData, req.query);

  return res.success('dashboard projects have been successfully retrieved', {
    page: paginationData.page,
    totalItems: paginationData.totalItems,
    totalPages: paginationData.totalPages,
    itemsPerPage: paginationData.itemsPerPage,
    projects,
  });
};

export default getUserProjectsFlow;
