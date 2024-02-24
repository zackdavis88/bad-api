import { validateConfirmation } from 'src/controllers/validationUtils';
import { Project } from 'src/models';

type RemoveProjectValidation = (project: Project, confirm: unknown) => void;

const removeProjectValidation: RemoveProjectValidation = (project, confirm) => {
  validateConfirmation(confirm, project.name);
};

export default removeProjectValidation;
