import { Project } from 'src/models';
import { ValidationError } from 'src/server/utils/errors';

type ValidateName = (existingStatuses: Project['statuses'], name: unknown) => void;

const validateName: ValidateName = (existingStatuses, name) => {
  const existingStatus = existingStatuses.find((status) => status.name === name);
  if (existingStatus) {
    throw new ValidationError('status already exists');
  }

  if (name === undefined || name === null) {
    throw new ValidationError('name is missing from input');
  }

  if (typeof name !== 'string') {
    throw new ValidationError('name must be a string');
  }

  if (name.length < 1 || name.length > 50) {
    throw new ValidationError('name must be 1 - 50 characters in length');
  }
};

export default validateName;
