import { validateConfirmation } from 'src/controllers/validationUtils';
import { User } from 'src/models';

type RemoveUserValidation = (user: User, confirm: unknown) => void;

const removeUserValidation: RemoveUserValidation = (user, confirm) => {
  validateConfirmation(confirm, user.username);
};

export default removeUserValidation;
