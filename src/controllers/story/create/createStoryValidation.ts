import { Project, Status, User } from 'src/models';
import {
  validateTitle,
  validateDetails,
  validateStatus,
  validateOwnedBy,
} from 'src/controllers/story/validationUtils';

type CreateStoryValidation = (
  project: Project,
  title: unknown,
  details: unknown,
  statusId: unknown,
  ownedByUsername: unknown,
) => Promise<{
  status: Status | null;
  ownedBy: User | null;
}>;

const createStoryValidation: CreateStoryValidation = async (
  project,
  title,
  details,
  statusId,
  ownedByUsername,
) => {
  validateTitle(title);
  validateDetails(details);
  const status = await validateStatus(project, statusId);
  const ownedBy = await validateOwnedBy(project, ownedByUsername);

  return {
    status,
    ownedBy,
  };
};

export default createStoryValidation;
