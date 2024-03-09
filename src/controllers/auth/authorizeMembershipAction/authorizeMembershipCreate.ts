import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeMembershipCreate = (
  authUserMembership: Project['authUserMembership'],
  adminPrivilegeRequired: boolean,
) => void;

const authorizeMembershipCreate: AuthorizeMembershipCreate = (
  authUserMembership,
  adminPrivilegeRequired,
) => {
  if (
    adminPrivilegeRequired &&
    (!authUserMembership || !authUserMembership.isProjectAdmin)
  ) {
    throw new AuthorizationError(
      'you do not have permission to create admin memberships for this project',
    );
  }

  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError(
      'you do not have permission to create memberships for this project',
    );
  }
};

export default authorizeMembershipCreate;
