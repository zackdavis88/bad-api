import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeUserUpdateOrRemove = (
  authenticatedUsername: string,
  requestedUsername: string,
) => void;

const authorizeUserUpdateOrRemove: AuthorizeUserUpdateOrRemove = (
  authenticatedUsername,
  requestedUsername,
) => {
  if (authenticatedUsername.toLowerCase() !== requestedUsername.toLowerCase()) {
    throw new AuthorizationError('you do not have permission to perform this action');
  }
};

export default authorizeUserUpdateOrRemove;
