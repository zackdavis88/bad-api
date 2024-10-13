import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeStoryUpdate = (authUserMembership: Project['authUserMembership']) => void;

const authorizeStoryUpdate: AuthorizeStoryUpdate = (authUserMembership) => {
  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin &&
      !authUserMembership.isProjectManager &&
      !authUserMembership.isProjectDeveloper)
  ) {
    throw new AuthorizationError(
      'you do not have permission to update stories for this project',
    );
  }
};

export default authorizeStoryUpdate;
