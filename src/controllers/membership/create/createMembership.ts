import { Project, User } from 'src/models';
import { MembershipData } from 'src/server/types';

type CreateMembership = (
  project: Project,
  authenticatedUser: User,
  membershipUser: User,
  roles: {
    isProjectAdmin: unknown;
    isProjectManager: unknown;
    isProjectDeveloper: unknown;
  },
) => Promise<MembershipData>;

const createMembership: CreateMembership = async (
  project,
  authenticatedUser,
  membershipUser,
  roles,
) => {
  const newMembership = await project.createMembership({
    userId: membershipUser.id,
    isProjectAdmin: !!roles.isProjectAdmin,
    isProjectManager: !!roles.isProjectManager,
    isProjectDeveloper: !!roles.isProjectDeveloper,
    createdById: authenticatedUser.id,
  });

  return {
    id: newMembership.id,
    user: {
      username: membershipUser.username,
      displayName: membershipUser.displayName,
    },
    project: {
      id: project.id,
      name: project.name,
    },
    isProjectAdmin: newMembership.isProjectAdmin,
    isProjectManager: newMembership.isProjectManager,
    isProjectDeveloper: newMembership.isProjectDeveloper,
    createdOn: newMembership.createdOn,
    createdBy: {
      username: authenticatedUser.username,
      displayName: authenticatedUser.displayName,
    },
  };
};

export default createMembership;
