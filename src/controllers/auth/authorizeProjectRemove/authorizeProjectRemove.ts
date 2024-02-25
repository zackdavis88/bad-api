import { Project, User } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeProjectRemove = (
  authenticatedUser: User,
  requestedProject: Project,
) => Promise<void>;

const authorizeProjectRemove: AuthorizeProjectRemove = async (
  authenticatedUser,
  requestedProject,
) => {
  const authUserMembership = requestedProject.authUserMembership;

  if (!authUserMembership || !authUserMembership.isProjectAdmin) {
    throw new AuthorizationError('you do not have permission to remove this project');
  }
};

export default authorizeProjectRemove;
