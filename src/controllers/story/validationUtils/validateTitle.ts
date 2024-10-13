import { ValidationError } from 'src/server/utils/errors';

type ValidateTitle = (title: unknown, isOptional?: boolean) => void;

const validateTitle: ValidateTitle = (title, isOptional = false) => {
  if (isOptional && (title === undefined || title === null)) {
    return;
  }

  if (title === undefined || title === null) {
    throw new ValidationError('title is missing from input');
  }

  if (typeof title !== 'string') {
    throw new ValidationError('title must be a string');
  }

  if (title.length < 1 || title.length > 150) {
    throw new ValidationError('title must be 1 - 150 characters in length');
  }
};

export default validateTitle;
