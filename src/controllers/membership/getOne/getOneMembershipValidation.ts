import { validateId } from 'src/controllers/validationUtils';

type GetOneMembershipValidation = (membershipId: string) => void;

const getOneMembershipValidation: GetOneMembershipValidation = (membershipId) => {
  validateId(membershipId, 'membership');
};

export default getOneMembershipValidation;
