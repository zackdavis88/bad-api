import {
  validateName,
  validateDescription,
} from 'src/controllers/project/validationUtils';
import { ValidationError } from 'src/server/utils/errors';

type UpdateProjectValidation = (name: unknown, description: unknown) => void;

const updateProjectValidation: UpdateProjectValidation = (name, description) => {
  if (name === undefined && description === undefined) {
    throw new ValidationError('input contains no update data');
  }

  validateName(name, true);
  validateDescription(description);
};

export default updateProjectValidation;
