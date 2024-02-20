import { Request } from 'express';
import { User } from 'src/models';
import { PaginationData, validatePagination } from 'src/controllers/validationUtils';

type GetAllUsersValidation = (queryString: Request['query']) => Promise<PaginationData>;

const getAllUsersValidation: GetAllUsersValidation = async (queryString) => {
  const userCount = await User.count({ where: { isActive: true } });
  return validatePagination(queryString, userCount);
};

export default getAllUsersValidation;
