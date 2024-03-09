import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeProjectUpdate = (authUserMembership: Project['authUserMembership']) => void;

const authorizeProjectUpdate: AuthorizeProjectUpdate = (authUserMembership) => {
  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError('you do not have permission to update this project');
  }
};

export default authorizeProjectUpdate;
