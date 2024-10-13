import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeStatusUpdate = (authUserMembership: Project['authUserMembership']) => void;

const authorizeStatusUpdate: AuthorizeStatusUpdate = (authUserMembership) => {
  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError(
      'you do not have permission to update statuses for this project',
    );
  }
};

export default authorizeStatusUpdate;
