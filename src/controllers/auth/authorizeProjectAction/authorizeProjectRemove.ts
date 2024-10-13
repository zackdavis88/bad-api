import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeProjectRemove = (authUserMembership: Project['authUserMembership']) => void;

const authorizeProjectRemove: AuthorizeProjectRemove = (authUserMembership) => {
  if (!authUserMembership || !authUserMembership.isProjectAdmin) {
    throw new AuthorizationError('you do not have permission to remove this project');
  }
};

export default authorizeProjectRemove;
