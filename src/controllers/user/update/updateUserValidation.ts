import { ValidationError } from 'src/server/utils/errors';
import { validatePassword } from 'src/controllers/user/validationUtils';
import { User } from 'src/models';

type UpdateUserValidation = (
  user: User,
  newPassword: unknown,
  currentPassword: unknown,
) => void;

const updateUserValidation: UpdateUserValidation = (
  user,
  newPassword,
  currentPassword,
) => {
  validatePassword(newPassword, 'newPassword');

  if (!currentPassword) {
    throw new ValidationError('currentPassword is missing from input');
  }

  if (typeof currentPassword !== 'string') {
    throw new ValidationError('currentPassword must be a string');
  }

  if (!user.compareHash(currentPassword)) {
    throw new ValidationError('currentPassword in invalid');
  }
};

export default updateUserValidation;
