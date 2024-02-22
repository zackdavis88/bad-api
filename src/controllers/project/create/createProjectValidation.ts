import {
  validateName,
  validateDescription,
} from 'src/controllers/project/validationUtils';

type CreateProjectValidation = (name: unknown, description: unknown) => void;

const createProjectValidation: CreateProjectValidation = (name, description) => {
  validateName(name);
  validateDescription(description);
};

export default createProjectValidation;
