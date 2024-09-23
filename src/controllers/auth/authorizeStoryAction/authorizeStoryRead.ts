import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeStoryRead = (authUserMembership: Project['authUserMembership']) => void;

const authorizeStoryRead: AuthorizeStoryRead = (authUserMembership) => {
  if (!authUserMembership) {
    throw new AuthorizationError(
      'you do not have permission to read stories for this project',
    );
  }
};

export default authorizeStoryRead;
