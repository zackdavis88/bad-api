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
  const membership = (
    await requestedProject.getMemberships({
      where: { userId: authenticatedUser.id },
    })
  )[0];

  if (!membership || !membership.isProjectAdmin) {
    throw new AuthorizationError('you do not have permission to remove this project');
  }
};

export default authorizeProjectRemove;
