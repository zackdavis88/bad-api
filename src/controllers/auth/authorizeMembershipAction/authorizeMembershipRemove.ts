import { Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeMembershipRemove = (
  authUserMembership: Project['authUserMembership'],
  requestedMembershipIsAdmin: boolean,
) => void;

const authorizeMembershipRemove: AuthorizeMembershipRemove = (
  authUserMembership,
  requestedMembershipIsAdmin,
) => {
  if (
    requestedMembershipIsAdmin &&
    (!authUserMembership || !authUserMembership.isProjectAdmin)
  ) {
    throw new AuthorizationError(
      'you do not have permission to remove admin memberships for this project',
    );
  }

  if (
    !authUserMembership ||
    (!authUserMembership.isProjectAdmin && !authUserMembership.isProjectManager)
  ) {
    throw new AuthorizationError(
      'you do not have permission to remove memberships for this project',
    );
  }
};

export default authorizeMembershipRemove;
