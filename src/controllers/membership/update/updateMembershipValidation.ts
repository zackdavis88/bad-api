import { ValidationError } from 'src/server/utils/errors';
import { validateRole } from '../validationUtils';

type UpdateMembershipValidation = (roles: {
  isProjectAdmin: unknown;
  isProjectManager: unknown;
}) => void;

const updateMembershipValidation: UpdateMembershipValidation = (roles) => {
  if (
    typeof roles.isProjectAdmin !== 'boolean' &&
    typeof roles.isProjectManager !== 'boolean'
  ) {
    throw new ValidationError('input contains no update data');
  }

  validateRole(roles.isProjectAdmin, 'isProjectAdmin');
  validateRole(roles.isProjectManager, 'isProjectManager');
};

export default updateMembershipValidation;
