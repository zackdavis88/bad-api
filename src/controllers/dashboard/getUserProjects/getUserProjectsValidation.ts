import { Request } from 'express';
import { User, Membership, Project } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';
import Sequelize, { WhereOptions } from 'sequelize';

type GetUserProjectsValidation = (
  user: User,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getUserProjectsValidation: GetUserProjectsValidation = async (
  user,
  queryString,
) => {
  const nameFilter = queryString.nameFilter;
  const projectWhereOptions: WhereOptions = {
    isActive: true,
  };
  if (nameFilter) {
    projectWhereOptions.name = {
      [Sequelize.Op.iLike]: `%${nameFilter}%`,
    };
  }

  const membershipCount = await Membership.count({
    include: [
      { model: User, where: { id: user.id }, as: 'user', required: true },
      {
        model: Project,
        where: projectWhereOptions,
        as: 'project',
        required: true,
      },
    ],
  });
  return validatePagination(queryString, membershipCount);
};

export default getUserProjectsValidation;
