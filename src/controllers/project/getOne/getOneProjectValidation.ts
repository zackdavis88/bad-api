import { validateId } from 'src/controllers/validationUtils';

type GetOneProjectValidation = (projectId: string) => void;

const getOneProjectValidation: GetOneProjectValidation = (projectId) => {
  validateId(projectId, 'project');
};

export default getOneProjectValidation;
