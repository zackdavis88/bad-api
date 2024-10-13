import { Request } from 'express';
import { Project } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';

type GetAllStatusesValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllStatusesValiation: GetAllStatusesValidation = async (
  project,
  queryString,
) => {
  const statusesCount = await project.countStatuses();
  return validatePagination(queryString, statusesCount);
};

export default getAllStatusesValiation;
