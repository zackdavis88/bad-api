import { Request, Response } from 'express';
import updateMembershipValidation from './updateMembershipValidation';
import updateMembership from './updateMembership';

interface UpdateMembershipRequestBody {
  isProjectAdmin: unknown;
  isProjectManager: unknown;
}

const updateMembershipFlow = async (
  req: Request<never, never, UpdateMembershipRequestBody>,
  res: Response,
) => {
  try {
    const roles = req.body;
    updateMembershipValidation(roles);
    const membershipData = await updateMembership(
      req.user,
      req.project,
      req.membership,
      roles,
    );
    return res.success('membership has been successfully updated', {
      membership: membershipData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default updateMembershipFlow;
