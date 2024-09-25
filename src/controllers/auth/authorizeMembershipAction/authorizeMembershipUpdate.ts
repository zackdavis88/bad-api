import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeMembershipUpdate = (
  authUserMembership: Project['authUserMembership'],
  requestedMembershipIsAdmin: boolean,
  isProjectAdminInputValue: unknown,
) => void;

const authorizeMembershipUpdate: AuthorizeMembershipUpdate = (
  authUserMembership,
  requestedMembershipIsAdmin,
  isProjectAdminInputValue,
) => {
  const isAddingAdminPrivileges = isProjectAdminInputValue === true;
  const isRemovingAdminPrivileges = isProjectAdminInputValue === false;

  // If the existing membership is NOT admin, you need to be admin to add it.
  if (
    !requestedMembershipIsAdmin &&
    isAddingAdminPrivileges &&
    (!authUserMembership || !authUserMembership.isProjectAdmin)
  ) {
    throw new AuthorizationError(
      'you do not have permission to add admin privileges to memberships for this project',
    );
  }

  // If the existing membership IS admin, you need to be admin to remove it.
  if (
    requestedMembershipIsAdmin &&
    isRemovingAdminPrivileges &&
    (!authUserMembership || !authUserMembership.isProjectAdmin)
  ) {
    throw new AuthorizationError(
      'you do not have permission to remove admin privileges from memberships for this project',
    );
  }

  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError(
      'you do not have permission to update memberships for this project',
    );
  }
};

export default authorizeMembershipUpdate;
