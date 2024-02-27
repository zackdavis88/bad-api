import { Request, Response } from 'express';
import createMembershipValidation from './createMembershipValidation';
import createMembership from './createMembership';

interface CreateMembershipRequestBody {
  username: unknown;
  isProjectAdmin: unknown;
  isProjectManager: unknown;
}

const createMembershipFlow = async (
  req: Request<never, never, CreateMembershipRequestBody>,
  res: Response,
) => {
  try {
    const { username, ...roles } = req.body;
    const membershipUser = await createMembershipValidation(req.project, username, roles);
    const membershipData = await createMembership(
      req.project,
      req.user,
      membershipUser,
      roles,
    );
    return res.success('membership has been successfully created', {
      membership: membershipData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default createMembershipFlow;
