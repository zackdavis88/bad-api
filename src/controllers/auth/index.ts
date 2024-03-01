import { default as generateToken } from './generateToken';
import { default as authenticateToken } from './authenticateToken';
import { default as getAuthenticationDetails } from './getAuthenticationDetails';
import { default as authorizeUserUpdate } from './authorizeUserUpdate';
import { default as authorizeProjectUpdate } from './authorizeProjectUpdate';
import { default as authorizeProjectRemove } from './authorizeProjectRemove';
import { default as authorizeMembershipAction } from './authorizeMembershipAction';

export default {
  generateToken,
  authenticateToken,
  getAuthenticationDetails,
  authorizeUserUpdate,
  authorizeProjectUpdate,
  authorizeProjectRemove,
  authorizeMembershipAction,
};
