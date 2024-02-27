import { Project, User } from 'src/models';
import { validateRole } from 'src/controllers/membership/validationUtils';
import { NotFoundError, ValidationError } from 'src/server/utils/errors';

type CreateMembershipValidation = (
  project: Project,
  username: unknown,
  roles: { isProjectAdmin: unknown; isProjectManager: unknown },
) => Promise<User>;

const createMembershipValidation: CreateMembershipValidation = async (
  project,
  username,
  roles,
) => {
  validateRole(roles.isProjectAdmin, 'isProjectAdmin');
  validateRole(roles.isProjectManager, 'isProjectManager');

  if (username === undefined || username === null) {
    throw new ValidationError('username is missing from input');
  }

  if (typeof username !== 'string') {
    throw new ValidationError('username must be a string');
  }

  const requestedUser = await User.findOne({
    where: { username: username.toLowerCase(), isActive: true },
  });
  if (!requestedUser) {
    throw new NotFoundError('requested user does not exist');
  }

  const existingMembership = await project.getMembership({
    where: { userId: requestedUser.id },
  });
  if (existingMembership) {
    throw new ValidationError('membership already exists for this user');
  }

  return requestedUser;
};

export default createMembershipValidation;
