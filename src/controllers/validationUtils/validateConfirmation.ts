import { ValidationError } from 'src/server/utils/errors';

type ValidateConfirmation = (
  confirmInput: unknown,
  expectedValue: unknown,
) => string | void;

const validateConfirmation: ValidateConfirmation = (confirmInput, expectedValue) => {
  if (confirmInput === undefined || confirmInput === null) {
    throw new ValidationError('confirm is missing from input');
  }

  const expectedType = typeof expectedValue;
  if (typeof confirmInput !== expectedType) {
    throw new ValidationError(`confirm input must be a ${expectedType.toLowerCase()}`);
  }

  if (confirmInput !== expectedValue) {
    throw new ValidationError(`confirm input must have a value of ${expectedValue}`);
  }
};

export default validateConfirmation;
