import { Request } from 'express';
import { Project, Membership, User } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';
import { Op, WhereOptions } from 'sequelize';

type GetAllMembershipsValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllMembershipsValiation: GetAllMembershipsValidation = async (
  project,
  queryString,
) => {
  let userWhereOptions: WhereOptions | undefined = undefined;
  const usernameFilter = queryString.usernameFilter;
  if (usernameFilter) {
    userWhereOptions = {
      username: {
        [Op.iLike]: `%${usernameFilter}%`,
      },
    };
  }

  const membershipCount = await Membership.count({
    where: {
      projectId: project.id,
    },
    include: { model: User, as: 'user', where: userWhereOptions, required: true },
  });
  return validatePagination(queryString, membershipCount);
};

export default getAllMembershipsValiation;
