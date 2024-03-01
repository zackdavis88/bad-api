import { AuthorizationAction } from 'src/server/types';
import authorizeUserUpdateOrRemove from './authorizeUserUpdateOrRemove';

type AuthorizeUserAction = (
  authenticatedUsername: string,
  requestedUsername: string,
  action: AuthorizationAction,
) => void;

const authorizeUserAction: AuthorizeUserAction = (
  authenticatedUsername,
  requestedUsername,
  action,
) => {
  if (action === AuthorizationAction.UPDATE || action === AuthorizationAction.DELETE) {
    authorizeUserUpdateOrRemove(authenticatedUsername, requestedUsername);
  }
};

export default authorizeUserAction;
