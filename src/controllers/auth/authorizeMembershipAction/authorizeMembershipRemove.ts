import { Membership, Project } from 'src/models';
import { AuthorizationError } from 'src/server/utils/errors';

type AuthorizeMembershipRemove = (
  authUserMembership: Project['authUserMembership'],
  requestedMembership: Membership,
) => void;

const authorizeMembershipRemove: AuthorizeMembershipRemove = (
  authUserMembership,
  requestedMembership,
) => {
  const requestedMembershipIsAdmin = requestedMembership.isProjectAdmin === true;

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
