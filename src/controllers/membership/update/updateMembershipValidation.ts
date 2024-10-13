import { ValidationError } from 'src/server/utils/errors';
import { validateRole } from '../validationUtils';

type UpdateMembershipValidation = (roles: {
  isProjectAdmin: unknown;
  isProjectManager: unknown;
  isProjectDeveloper: unknown;
}) => void;

const updateMembershipValidation: UpdateMembershipValidation = (roles) => {
  if (
    typeof roles.isProjectAdmin !== 'boolean' &&
    typeof roles.isProjectManager !== 'boolean' &&
    typeof roles.isProjectDeveloper !== 'boolean'
  ) {
    throw new ValidationError('input contains no update data');
  }

  validateRole(roles.isProjectAdmin, 'isProjectAdmin');
  validateRole(roles.isProjectManager, 'isProjectManager');
  validateRole(roles.isProjectDeveloper, 'isProjectDeveloper');
};

export default updateMembershipValidation;
