import { ValidationError } from 'src/server/utils/errors';

type ValidateDetails = (details: unknown) => void;

const validateDetails: ValidateDetails = (details) => {
  if (details === undefined || details === null) {
    return;
  }

  if (typeof details !== 'string') {
    throw new ValidationError('details must be a string');
  }
};

export default validateDetails;
