import { Request, Response, NextFunction } from 'express';
import getOneMembershipValidation from './getOneMembershipValidation';
import getOneMembership from './getOneMembership';

export const getMembershipMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = req.project;
    getOneMembershipValidation(req.params.membershipId);
    const membership = await getOneMembership(project, req.params.membershipId);
    req.membership = membership;
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

const getOneMembershipFlow = async (req: Request, res: Response) => {
  const project = req.project;
  const membership = req.membership;

  const membershipData = {
    id: membership.id,
    user: {
      username: membership.user.username,
      displayName: membership.user.displayName,
    },
    project: {
      id: project.id,
      name: project.name,
    },
    isProjectAdmin: membership.isProjectAdmin,
    isProjectManager: membership.isProjectManager,
    isProjectDeveloper: membership.isProjectDeveloper,
    createdOn: membership.createdOn,
    createdBy:
      membership.createdById && membership.createdBy ?
        {
          username: membership.createdBy.username,
          displayName: membership.createdBy.displayName,
        }
      : null,
    updatedOn: membership.updatedOn,
    updatedBy:
      membership.updatedById && membership.updatedBy ?
        {
          username: membership.updatedBy.username,
          displayName: membership.updatedBy.displayName,
        }
      : null,
  };

  return res.success('membership has been successfully retrieved', {
    membership: membershipData,
  });
};

export default getOneMembershipFlow;
