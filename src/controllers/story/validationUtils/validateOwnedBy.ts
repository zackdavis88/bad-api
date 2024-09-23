import { Project, User } from 'src/models';
import { NotFoundError, ValidationError } from 'src/server/utils/errors';

type ValidateOwnedBy = (project: Project, ownedBy: unknown) => Promise<User | null>;

const validateOwnedBy: ValidateOwnedBy = async (project, ownedBy) => {
  if (ownedBy === undefined || ownedBy === null) {
    return null;
  }

  if (typeof ownedBy !== 'string') {
    throw new ValidationError('ownedBy must be a string');
  }

  const requestedUser = await User.findOne({
    where: { username: ownedBy.toLowerCase(), isActive: true },
  });
  if (!requestedUser) {
    throw new NotFoundError('ownedBy user does not exist');
  }

  const existingMembership = await project.getMembership({
    where: { userId: requestedUser.id },
  });
  if (!existingMembership) {
    throw new ValidationError('ownedBy user must be a project member');
  }

  if (
    !existingMembership.isProjectAdmin &&
    !existingMembership.isProjectManager &&
    !existingMembership.isProjectDeveloper
  ) {
    throw new ValidationError('ownedBy user must have developer permissions or higher');
  }

  return requestedUser;
};

export default validateOwnedBy;
