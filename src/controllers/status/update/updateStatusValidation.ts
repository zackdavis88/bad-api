import { Project } from 'src/models';
import { validateName } from 'src/controllers/status/validationUtils';

type UpdateStatusValidation = (project: Project, name: unknown) => Promise<void>;

const updateStatusValidation: UpdateStatusValidation = async (project, name) => {
  await validateName(project, name);
};

export default updateStatusValidation;
