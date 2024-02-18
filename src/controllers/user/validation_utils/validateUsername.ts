import { User } from 'src/models';
import { ValidationError } from 'src/controllers/validation_utils';

const validateUsername = async (username: unknown) => {
  if (username === null || username === undefined) {
    throw new ValidationError('username is missing from input');
  }

  if (typeof username !== 'string') {
    throw new ValidationError('username must be a string');
  }

  if (username.length < 3 || username.length > 30) {
    throw new ValidationError('username must be 3 - 30 characters in length');
  }

  const regex = new RegExp('^[A-Za-z0-9-_]+$');
  if (!regex.test(username)) {
    throw new ValidationError(
      'username may only contain alphanumeric, - (dash), and _ (underscore) characters',
    );
  }

  const existingUser = await User.findOne({
    where: {
      username: username.toLowerCase(),
      isActive: true,
    },
  });

  if (existingUser) {
    throw new ValidationError('username is already taken');
  }
};

export default validateUsername;
