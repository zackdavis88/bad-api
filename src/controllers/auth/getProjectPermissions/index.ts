import { Request, Response } from 'express';
import authorizeProjectRemove from 'src/controllers/auth/authorizeProjectAction/authorizeProjectRemove';
import authorizeProjectUpdate from 'src/controllers/auth/authorizeProjectAction/authorizeProjectUpdate';
import authorizeMembershipCreate from 'src/controllers/auth/authorizeMembershipAction/authorizeMembershipCreate';
import authorizeStatusCreate from 'src/controllers/auth/authorizeStatusAction/authorizeStatusCreate';
import authorizeStatusUpdate from 'src/controllers/auth/authorizeStatusAction/authorizeStatusUpdate';
import authorizeStatusRemove from 'src/controllers/auth/authorizeStatusAction/authorizeStatusRemove';
import authorizeStoryCreate from 'src/controllers/auth/authorizeStoryAction/authorizeStoryCreate';
import authorizeStoryUpdate from 'src/controllers/auth/authorizeStoryAction/authorizeStoryUpdate';
import authorizeStoryRead from 'src/controllers/auth/authorizeStoryAction/authorizeStoryRead';
import authorizeStoryRemove from 'src/controllers/auth/authorizeStoryAction/authorizeStoryRemove';
import authorizeMembershipUpdate from 'src/controllers/auth/authorizeMembershipAction/authorizeMembershipUpdate';
import authorizeMembershipRemove from 'src/controllers/auth/authorizeMembershipAction/authorizeMembershipRemove';

const getProjectPermissions = (req: Request, res: Response) => {
  const { authUserMembership } = req.project;
  let canRemoveProject: boolean;
  let canUpdateProject: boolean;

  let canCreateAdminMembership: boolean;
  let canCreateMembership: boolean;
  let canUpdateAdminMembership: boolean;
  let canUpdateMembership: boolean;
  let canRemoveAdminMembership: boolean;
  let canRemoveMembership: boolean;

  let canCreateStatus: boolean;
  let canUpdateStatus: boolean;
  let canRemoveStatus: boolean;

  let canCreateStory: boolean;
  let canUpdateStory: boolean;
  let canRemoveStory: boolean;
  let canReadStory: boolean;

  try {
    authorizeProjectRemove(authUserMembership);
    canRemoveProject = true;
  } catch {
    canRemoveProject = false;
  }

  try {
    authorizeProjectUpdate(authUserMembership);
    canUpdateProject = true;
  } catch {
    canUpdateProject = false;
  }

  try {
    authorizeMembershipCreate(authUserMembership, true);
    canCreateAdminMembership = true;
  } catch {
    canCreateAdminMembership = false;
  }

  try {
    authorizeMembershipUpdate(authUserMembership, true, false);
    canUpdateAdminMembership = true;
  } catch {
    canUpdateAdminMembership = false;
  }

  try {
    authorizeMembershipRemove(authUserMembership, true);
    canRemoveAdminMembership = true;
  } catch {
    canRemoveAdminMembership = false;
  }

  try {
    authorizeMembershipCreate(authUserMembership, false);
    canCreateMembership = true;
  } catch {
    canCreateMembership = false;
  }

  try {
    authorizeMembershipUpdate(authUserMembership, false, null);
    canUpdateMembership = true;
  } catch {
    canUpdateMembership = false;
  }

  try {
    authorizeMembershipRemove(authUserMembership, false);
    canRemoveMembership = true;
  } catch {
    canRemoveMembership = false;
  }

  try {
    authorizeStatusCreate(authUserMembership);
    canCreateStatus = true;
  } catch {
    canCreateStatus = false;
  }

  try {
    authorizeStatusUpdate(authUserMembership);
    canUpdateStatus = true;
  } catch {
    canUpdateStatus = false;
  }

  try {
    authorizeStatusRemove(authUserMembership);
    canRemoveStatus = true;
  } catch {
    canRemoveStatus = false;
  }

  try {
    authorizeStoryCreate(authUserMembership);
    canCreateStory = true;
  } catch {
    canCreateStory = false;
  }

  try {
    authorizeStoryUpdate(authUserMembership);
    canUpdateStory = true;
  } catch {
    canUpdateStory = false;
  }

  try {
    authorizeStoryRemove(authUserMembership);
    canRemoveStory = true;
  } catch {
    canRemoveStory = false;
  }

  try {
    authorizeStoryRead(authUserMembership);
    canReadStory = true;
  } catch {
    canReadStory = false;
  }

  return res.success('project permissions successfully retrieved', {
    permissions: {
      canRemoveProject,
      canUpdateProject,
      canCreateAdminMembership,
      canCreateMembership,
      canUpdateAdminMembership,
      canUpdateMembership,
      canRemoveAdminMembership,
      canRemoveMembership,
      canCreateStatus,
      canUpdateStatus,
      canRemoveStatus,
      canCreateStory,
      canUpdateStory,
      canRemoveStory,
      canReadStory,
    },
  });
};

export default getProjectPermissions;
