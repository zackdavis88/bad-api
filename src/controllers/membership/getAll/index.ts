import { Request, Response } from 'express';
import getAllMembershipsValiation from './getAllMembershipsValidation';
import getAllMemberships from './getAllMemberships';

const getAllMembershipsFlow = async (req: Request, res: Response) => {
  try {
    const project = req.project;
    const paginationData = await getAllMembershipsValiation(project, req.query);
    const memberships = await getAllMemberships(project, paginationData, req.query);

    return res.success('membership list has been successfully retrieved', {
      page: paginationData.page,
      totalItems: paginationData.totalItems,
      totalPages: paginationData.totalPages,
      itemsPerPage: paginationData.itemsPerPage,
      project: {
        id: project.id,
        name: project.name,
      },
      memberships,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default getAllMembershipsFlow;
