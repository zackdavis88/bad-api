import { Membership, Project, User } from 'src/models';
import { MembershipData } from 'src/server/types';

type RemoveMembership = (
  authUser: User,
  project: Project,
  membership: Membership,
) => Promise<MembershipData>;

const removeMembership: RemoveMembership = async (authUser, project, membership) => {
  await membership.destroy();

  return {
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
    updatedBy:
      membership.updatedById && membership.updatedBy ?
        {
          username: membership.updatedBy.username,
          displayName: membership.updatedBy.displayName,
        }
      : null,
    deletedOn: new Date(),
    deletedBy: {
      username: authUser.username,
      displayName: authUser.displayName,
    },
  };
};

export default removeMembership;
