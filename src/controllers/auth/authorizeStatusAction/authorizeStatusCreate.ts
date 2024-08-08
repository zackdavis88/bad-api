import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeStatusCreate = (authUserMembership: Project['authUserMembership']) => void;

const authorizeStatusCreate: AuthorizeStatusCreate = (authUserMembership) => {
  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError(
      'you do not have permission to create statuses for this project',
    );
  }
};

export default authorizeStatusCreate;
