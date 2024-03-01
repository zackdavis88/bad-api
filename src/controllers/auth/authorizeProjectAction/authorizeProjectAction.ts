import { Project } from 'src/models';
import { AuthorizationAction } from 'src/server/types';
import authorizeProjectUpdate from './authorizeProjectUpdate';
import authorizeProjectRemove from './authorizeProjectRemove';

type AuthorizeProjectAction = (
  authUserMembership: Project['authUserMembership'],
  action: AuthorizationAction,
) => void;

const authorizeProjectAction: AuthorizeProjectAction = (authUserMembership, action) => {
  if (action === AuthorizationAction.UPDATE) {
    authorizeProjectUpdate(authUserMembership);
    return;
  }

  if (action === AuthorizationAction.DELETE) {
    authorizeProjectRemove(authUserMembership);
    return;
  }
};

export default authorizeProjectAction;
