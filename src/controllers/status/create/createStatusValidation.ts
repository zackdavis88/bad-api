import { Project } from 'src/models';
import { ValidationError } from 'src/server/utils/errors';
import { validateName } from 'src/controllers/status/validationUtils';

type CreateStatusValidation = (
  existingStatuses: Project['statuses'],
  name: unknown,
) => void;

const createStatusValidation: CreateStatusValidation = (existingStatuses, name) => {
  // Limit the amount of statuses a project can have to 100
  if (existingStatuses.length > 100) {
    throw new ValidationError('project has exceeded status limit of 100');
  }

  validateName(existingStatuses, name);
};

export default createStatusValidation;
