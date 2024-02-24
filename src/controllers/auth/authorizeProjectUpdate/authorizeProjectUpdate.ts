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
  const membership = (
    await requestedProject.getMemberships({
      where: { userId: authenticatedUser.id },
    })
  )[0];

  if (!membership || (!membership.isProjectAdmin && !membership.isProjectManager)) {
    throw new AuthorizationError('you do not have permission to update this project');
  }
};

export default authorizeProjectUpdate;
