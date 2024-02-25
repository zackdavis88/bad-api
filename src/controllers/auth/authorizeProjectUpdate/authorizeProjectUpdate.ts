import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeProjectUpdate = (requestedProject: Project) => void;

const authorizeProjectUpdate: AuthorizeProjectUpdate = (requestedProject) => {
  const authUserMembership = requestedProject.authUserMembership;

  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError('you do not have permission to update this project');
  }
};

export default authorizeProjectUpdate;
