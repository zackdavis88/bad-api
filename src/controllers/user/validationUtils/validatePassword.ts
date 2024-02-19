import { ValidationError } from 'src/server/utils/errors';

const validatePassword = (password: unknown) => {
  if (password === null || password === undefined) {
    throw new ValidationError('password is missing from input');
  }

  if (typeof password !== 'string') {
    throw new ValidationError('password must be a string');
  }

  if (password.length < 8) {
    throw new ValidationError('password must be at least 8 characters in length');
  }

  const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$');
  if (!regex.test(password)) {
    throw new ValidationError(
      'password must have 1 uppercase, lowercase, and number character',
    );
  }
};

export default validatePassword;
