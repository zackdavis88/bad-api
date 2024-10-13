import { Request, Response } from 'express';
import removeMembershipValidation from './removeMembershipValidation';
import removeMembership from './removeMembership';

interface RemoveMembershipRequestBody {
  confirm: unknown;
}

const removeMembershipFlow = async (
  req: Request<never, never, RemoveMembershipRequestBody>,
  res: Response,
) => {
  try {
    removeMembershipValidation(req.body.confirm);
    const membershipData = await removeMembership(req.user, req.project, req.membership);
    return res.success('membership has been successfully removed', {
      membership: membershipData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default removeMembershipFlow;
