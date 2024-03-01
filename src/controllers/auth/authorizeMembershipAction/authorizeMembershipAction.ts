import { Project } from 'src/models';
import { AuthorizationAction } from 'src/server/types';
import authorizeMembershipCreate from './authorizeMembershipCreate';

type AuthorizeMembershipAction = (
  project: Project['authUserMembership'],
  isProjectAdminFlag: unknown,
  action: AuthorizationAction,
) => void;

const authorizeMembershipAction: AuthorizeMembershipAction = (
  authUserMembership,
  isProjectAdminFlag,
  action,
) => {
  if (action === AuthorizationAction.CREATE) {
    const isAdminRequired = isProjectAdminFlag === true;
    authorizeMembershipCreate(authUserMembership, isAdminRequired);
    return;
  }

  // TODO: More action handling here for UPDATE and DELETE
};

export default authorizeMembershipAction;
