import { Request } from 'express';
import { User, Membership, Project } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';

type GetUserProjectsValidation = (
  user: User,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getUserProjectsValidation: GetUserProjectsValidation = async (
  user,
  queryString,
) => {
  const membershipCount = await Membership.count({
    include: [
      { model: User, where: { id: user.id }, as: 'user', required: true },
      { model: Project, where: { isActive: true }, as: 'project', required: true },
    ],
  });
  return validatePagination(queryString, membershipCount);
};

export default getUserProjectsValidation;
