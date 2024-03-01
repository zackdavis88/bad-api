import { Request, Response } from 'express';
import getOneMembershipValidation from './getOneMembershipValidation';
import getOneMembership from './getOneMembership';

const getOneMembershipFlow = async (req: Request, res: Response) => {
  try {
    const project = req.project;
    getOneMembershipValidation(req.params.membershipId);
    const membershipData = await getOneMembership(project, req.params.membershipId);

    return res.success('membership has been successfully retrieved', {
      membership: membershipData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default getOneMembershipFlow;
