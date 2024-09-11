import { Project, Status } from 'src/models';
import {
  validateTitle,
  validateDetails,
  validateStatus,
} from 'src/controllers/story/validationUtils';

type CreateStoryValidation = (
  project: Project,
  title: unknown,
  details: unknown,
  statusId: unknown,
) => Promise<Status | null>;

const createStoryValidation: CreateStoryValidation = async (
  project,
  title,
  details,
  statusId,
) => {
  validateTitle(title);
  validateDetails(details);
  const status = await validateStatus(project, statusId);
  return status;
};

export default createStoryValidation;
