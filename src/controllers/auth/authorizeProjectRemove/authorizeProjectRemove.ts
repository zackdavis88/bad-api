import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeProjectRemove = (requestedProject: Project) => void;

const authorizeProjectRemove: AuthorizeProjectRemove = (requestedProject) => {
  const authUserMembership = requestedProject.authUserMembership;

  if (!authUserMembership || !authUserMembership.isProjectAdmin) {
    throw new AuthorizationError('you do not have permission to remove this project');
  }
};

export default authorizeProjectRemove;
