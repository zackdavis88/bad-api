import { ValidationError } from 'src/server/utils/errors';

type ValidateRole = (roleInput: unknown, roleName: string) => void;

const validateRole: ValidateRole = (roleInput, roleName) => {
  if (roleInput === undefined || roleInput === null) {
    return;
  }

  if (typeof roleInput !== 'boolean') {
    throw new ValidationError(`${roleName} must be a boolean`);
  }
};

export default validateRole;
