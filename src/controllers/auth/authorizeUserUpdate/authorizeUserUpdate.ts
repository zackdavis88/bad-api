import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeUserUpdate = (
  authenticatedUsername: string,
  requestedUsername: string,
) => void;

const authorizeUserUpdate: AuthorizeUserUpdate = (
  authenticatedUsername,
  requestedUsername,
) => {
  if (authenticatedUsername.toLowerCase() !== requestedUsername.toLowerCase()) {
    throw new AuthorizationError('you do not have permission to perform this action');
  }
};

export default authorizeUserUpdate;
