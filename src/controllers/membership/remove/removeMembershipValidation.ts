import { validateConfirmation } from 'src/controllers/validationUtils';

type RemoveMembershipValidation = (confirm: unknown) => void;

const removeMembershipValidation: RemoveMembershipValidation = (confirm) => {
  validateConfirmation(confirm, true);
};

export default removeMembershipValidation;
