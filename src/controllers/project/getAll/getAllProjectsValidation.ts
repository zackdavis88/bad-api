import { Request } from 'express';
import { Project } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';

type GetAllProjectsValidation = (
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllProjectsValiation: GetAllProjectsValidation = async (queryString) => {
  const projectCount = await Project.count({ where: { isActive: true } });
  return validatePagination(queryString, projectCount);
};

export default getAllProjectsValiation;
