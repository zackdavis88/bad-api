import { validateConfirmation } from 'src/controllers/validationUtils';

type RemoveStoryValidation = (confirm: unknown) => void;

const removeStoryValidation: RemoveStoryValidation = (confirm) => {
  validateConfirmation(confirm, true);
};

export default removeStoryValidation;
