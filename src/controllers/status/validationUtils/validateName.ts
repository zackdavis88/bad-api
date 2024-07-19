import { Project } from 'src/models';
import { ValidationError } from 'src/server/utils/errors';

type ValidateName = (project: Project, name: unknown) => Promise<void>;

const validateName: ValidateName = async (project, name) => {
  const existingStatus = await project.getStatus({ where: { name } });
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
