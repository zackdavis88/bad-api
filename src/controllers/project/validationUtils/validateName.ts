import { ValidationError } from 'src/server/utils/errors';

type ValidateName = (name: unknown, isOptional?: boolean) => void;

const validateName: ValidateName = (name, isOptional = false) => {
  if (isOptional && (name === undefined || name === null)) {
    return;
  }

  if (name === undefined || name === null) {
    throw new ValidationError('name is missing from input');
  }

  if (typeof name !== 'string') {
    throw new ValidationError('name must be a string');
  }

  if (name.length < 3 || name.length > 30) {
    throw new ValidationError('name must be 3 - 30 characters in length');
  }

  const regex = new RegExp('^[A-Za-z0-9-_+=&^%$#*@!|/(){}?.,<>;\':" ]+$');
  if (!regex.test(name)) {
    throw new ValidationError('name contains invalid characters');
  }
};

export default validateName;
