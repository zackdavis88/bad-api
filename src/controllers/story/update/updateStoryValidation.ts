import { Project, Status, User } from 'src/models';
import {
  validateTitle,
  validateDetails,
  validateStatus,
  validateOwnedBy,
} from 'src/controllers/story/validationUtils';
import { ValidationError } from 'src/server/utils/errors';

type UpdateStoryValidation = (
  project: Project,
  title: unknown,
  details: unknown,
  statusId: unknown,
  ownedByUsername: unknown,
) => Promise<{
  status: Status | null;
  ownedBy: User | null;
}>;

const updateStoryValidation: UpdateStoryValidation = async (
  project,
  title,
  details,
  statusId,
  ownedByUsername,
) => {
  if (
    title === undefined &&
    details === undefined &&
    statusId === undefined &&
    ownedByUsername === undefined
  ) {
    throw new ValidationError('input contains no update data');
  }

  validateTitle(title, true);
  validateDetails(details);
  const status = await validateStatus(project, statusId);
  const ownedBy = await validateOwnedBy(project, ownedByUsername);

  return {
    status,
    ownedBy,
  };
};

export default updateStoryValidation;
