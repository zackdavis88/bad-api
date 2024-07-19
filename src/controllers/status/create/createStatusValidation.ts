import { Project } from 'src/models';
import { ValidationError } from 'src/server/utils/errors';
import { validateName } from 'src/controllers/status/validationUtils';

type CreateStatusValidation = (project: Project, name: unknown) => void;

const createStatusValidation: CreateStatusValidation = async (project, name) => {
  // Limit the amount of statuses a project can have to 100
  const statusCount = await project.countStatuses();
  if (statusCount > 100) {
    throw new ValidationError('project has exceeded status limit of 100');
  }

  await validateName(project, name);
};

export default createStatusValidation;
