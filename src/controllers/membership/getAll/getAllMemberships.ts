import { Project, User } from 'src/models';
import { PaginationData } from 'src/controllers/validationUtils';
import { MembershipData } from 'src/server/types';

type GetAllMemberships = (
  project: Project,
  paginationData: PaginationData,
) => Promise<Omit<MembershipData, 'project'>[]>;

const getAllMemberships: GetAllMemberships = async (project, paginationData) => {
  const { itemsPerPage, pageOffset } = paginationData;
  const memberships = await project.getMemberships({
    limit: itemsPerPage,
    offset: pageOffset,
    order: [['createdOn', 'ASC']],
    include: [
      { model: User.scope('publicAttributes'), as: 'createdBy', required: false },
      { model: User.scope('publicAttributes'), as: 'updatedBy', required: false },
      { model: User.scope('publicAttributes'), as: 'user' },
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
