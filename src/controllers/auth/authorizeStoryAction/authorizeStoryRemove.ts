import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeStoryRemove = (authUserMembership: Project['authUserMembership']) => void;

const authorizeStoryRemove: AuthorizeStoryRemove = (authUserMembership) => {
  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin &&
      !authUserMembership.isProjectManager &&
      !authUserMembership.isProjectDeveloper)
  ) {
    throw new AuthorizationError(
      'you do not have permission to remove stories for this project',
    );
  }
};

export default authorizeStoryRemove;
