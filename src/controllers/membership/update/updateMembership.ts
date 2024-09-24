import { Membership, Project, User } from 'src/models';
import { MembershipData } from 'src/server/types';

type UpdateMembership = (
  authUser: User,
  project: Project,
  membership: Membership,
  roles: {
    isProjectAdmin: unknown;
    isProjectManager: unknown;
    isProjectDeveloper: unknown;
  },
) => Promise<MembershipData>;

const updateMembership: UpdateMembership = async (
  authUser,
  project,
  membership,
  roles,
) => {
  if (typeof roles.isProjectAdmin === 'boolean') {
    membership.isProjectAdmin = roles.isProjectAdmin;
  }

  if (typeof roles.isProjectManager === 'boolean') {
    membership.isProjectManager = roles.isProjectManager;
  }

  if (typeof roles.isProjectDeveloper === 'boolean') {
    membership.isProjectDeveloper = roles.isProjectDeveloper;
  }

  membership.updatedById = authUser.id;
  membership.updatedOn = new Date();
  await membership.save();

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
    isProjectDeveloper: membership.isProjectDeveloper,
    createdOn: membership.createdOn,
    createdBy:
      membership.createdById && membership.createdBy ?
        {
          username: membership.createdBy.username,
          displayName: membership.createdBy.displayName,
        }
      : null,
    updatedOn: membership.updatedOn,
    updatedBy: {
      username: authUser.username,
      displayName: authUser.displayName,
    },
  };

  return membershipData;
};

export default updateMembership;
