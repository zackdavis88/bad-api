import { Status, Project } from 'src/models';
import getOneStatusValidation from 'src/controllers/status/getOne/getOneStatusValidation';
import getOneStatus from 'src/controllers/status/getOne/getOneStatus';
import { ValidationError } from 'src/server/utils/errors';

type ValidateStatus = (project: Project, statusId: unknown) => Promise<Status | null>;

const validateStatus: ValidateStatus = async (project, statusId) => {
  if (statusId === undefined || statusId === null) {
    return null;
  }

  if (typeof statusId !== 'string') {
    throw new ValidationError('status must be a string');
  }

  getOneStatusValidation(statusId);
  const status = await getOneStatus(project, statusId);

  return status;
};

export default validateStatus;
