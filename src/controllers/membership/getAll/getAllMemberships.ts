import { Project, User } from 'src/models';
import { PaginationData } from 'src/controllers/validationUtils';
import { MembershipData } from 'src/server/types';
import { Request } from 'express';
import { Op, WhereOptions } from 'sequelize';

type GetAllMemberships = (
  project: Project,
  paginationData: PaginationData,
  queryString: Request['query'],
) => Promise<Omit<MembershipData, 'project'>[]>;

const getAllMemberships: GetAllMemberships = async (
  project,
  paginationData,
  queryString,
) => {
  const { itemsPerPage, pageOffset } = paginationData;
  const usernameFilter = queryString.usernameFilter;
  let userWhereOptions: WhereOptions | undefined = undefined;
  if (usernameFilter) {
    userWhereOptions = {
      username: {
        [Op.iLike]: `%${usernameFilter}%`,
      },
    };
  }

  // Maybe there is a better way to do this, but this works for now.
  // Probably need to improve it if more ordering is needed in the future.
  let createdOnOrder = 'ASC';
  if (
    typeof queryString.createdOnOrder === 'string' &&
    queryString.createdOnOrder.toUpperCase() === 'DESC'
  ) {
    createdOnOrder = 'DESC';
  }

  const memberships = await project.getMemberships({
    limit: itemsPerPage,
    offset: pageOffset,
    order: [['createdOn', createdOnOrder]],
    include: [
      { model: User.scope('publicAttributes'), as: 'createdBy', required: false },
      { model: User.scope('publicAttributes'), as: 'updatedBy', required: false },
      {
        model: User.scope('publicAttributes'),
        as: 'user',
        where: userWhereOptions,
        required: true,
      },
    ],
  });

  return memberships.map((membership) => ({
    id: membership.id,
    user: {
      username: membership.user.username,
      displayName: membership.user.displayName,
    },
    isProjectAdmin: membership.isProjectAdmin,
    isProjectManager: membership.isProjectManager,
    isProjectDeveloper: membership.isProjectDeveloper,
    createdOn: membership.createdOn,
    createdBy:
      membership.createdById && membership.createdBy ?
        {
          displayName: membership.createdBy.displayName,
          username: membership.createdBy.username,
        }
      : null,
    updatedOn: membership.updatedOn,
    updatedBy:
      membership.updatedById && membership.updatedBy ?
        {
          displayName: membership.updatedBy.displayName,
          username: membership.updatedBy.username,
        }
      : null,
  }));
};

export default getAllMemberships;
