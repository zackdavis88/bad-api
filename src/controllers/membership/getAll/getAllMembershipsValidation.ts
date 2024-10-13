import { Request } from 'express';
import { Project } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';

type GetAllMembershipsValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllMembershipsValiation: GetAllMembershipsValidation = async (
  project,
  queryString,
) => {
  const membershipCount = await project.countMemberships();
  return validatePagination(queryString, membershipCount);
};

export default getAllMembershipsValiation;
