import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeStoryCreate = (authUserMembership: Project['authUserMembership']) => void;

const authorizeStoryCreate: AuthorizeStoryCreate = (authUserMembership) => {
  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin &&
      !authUserMembership.isProjectManager &&
      !authUserMembership.isProjectDeveloper)
  ) {
    throw new AuthorizationError(
      'you do not have permission to create stories for this project',
    );
  }
};

export default authorizeStoryCreate;
