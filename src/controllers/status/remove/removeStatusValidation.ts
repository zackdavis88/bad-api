import { validateConfirmation } from 'src/controllers/validationUtils';

type RemoveStatusValidation = (confirm: unknown) => void;

const removeStatusValidation: RemoveStatusValidation = (confirm) => {
  validateConfirmation(confirm, true);
};

export default removeStatusValidation;
