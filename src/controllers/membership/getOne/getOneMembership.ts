import { User, Project } from 'src/models';
import { MembershipData } from 'src/server/types';
import { NotFoundError } from 'src/server/utils/errors';

type GetOneMembership = (
  project: Project,
  membershipId: string,
) => Promise<MembershipData>;

const getOneMembership: GetOneMembership = async (project, membershipId) => {
  const membership = await project.getMembership({
    where: { id: membershipId },
    include: [
      { model: User.scope('publicAttributes'), as: 'createdBy', required: false },
      { model: User.scope('publicAttributes'), as: 'updatedBy', required: false },
      { model: User.scope('publicAttributes'), as: 'user' },
    ],
  });

  if (!membership) {
    throw new NotFoundError('requested membership not found');
  }

  const membershipData = {
    id: membership.id,
    user: {
      username: membership.user.username,
      displayName: membership.user.displayName,
    },
    project: {
      id: project.id,
      name: project.name,
    },
    isProjectAdmin: membership.isProjectAdmin,
    isProjectManager: membership.isProjectManager,
    createdOn: membership.createdOn,
    createdBy:
      membership.createdById && membership.createdBy ?
        {
          username: membership.createdBy.username,
          displayName: membership.createdBy.displayName,
        }
      : null,
    updatedOn: membership.updatedOn,
    updatedBy:
      membership.updatedById && membership.updatedBy ?
        {
          username: membership.updatedBy.username,
          displayName: membership.updatedBy.displayName,
        }
      : null,
  };

  return membershipData;
};

export default getOneMembership;
