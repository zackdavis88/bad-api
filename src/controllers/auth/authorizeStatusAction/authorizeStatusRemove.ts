import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeStatusRemove = (authUserMembership: Project['authUserMembership']) => void;

const authorizeStatusRemove: AuthorizeStatusRemove = (authUserMembership) => {
  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError(
      'you do not have permission to remove statuses for this project',
    );
  }
};

export default authorizeStatusRemove;
