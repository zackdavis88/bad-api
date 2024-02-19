import { Request, Response } from 'express';
import getAllUsersValidation from './getAllUsersValidation';
import getAllUsers from './getAllUsers';

const getAllUsersFlow = async (req: Request, res: Response) => {
  try {
    const paginationData = await getAllUsersValidation(req.query);
    const users = await getAllUsers(paginationData);

    return res.success('user list has been successfully retrieved', {
      page: paginationData.page,
      totalPages: paginationData.totalPages,
      totalItems: paginationData.totalItems,
      itemsPerPage: paginationData.itemsPerPage,
      users,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default getAllUsersFlow;
