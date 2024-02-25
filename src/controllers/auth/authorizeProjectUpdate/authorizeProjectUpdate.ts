import { Project, User } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeProjectUpdate = (
  authenticatedUser: User,
  requestedProject: Project,
) => Promise<void>;

const authorizeProjectUpdate: AuthorizeProjectUpdate = async (
  authenticatedUser,
  requestedProject,
) => {
  const authUserMembership = requestedProject.authUserMembership;

  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError('you do not have permission to update this project');
  }
};

export default authorizeProjectUpdate;
