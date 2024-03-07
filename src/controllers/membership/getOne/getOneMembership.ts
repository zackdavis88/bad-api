import { User, Project, Membership } from 'src/models';
import { NotFoundError } from 'src/server/utils/errors';

type GetOneMembership = (project: Project, membershipId: string) => Promise<Membership>;

const getOneMembership: GetOneMembership = async (project, membershipId) => {
  const membership = await project.getMembership({
    where: { id: membershipId },
    include: [
      { model: User.scope('publicAttributes'), as: 'createdBy', required: false },
      { model: User.scope('publicAttributes'), as: 'updatedBy', required: false },
      { model: User.scope('publicAttributes'), as: 'user' },
    ],
  });

  if (!membership) {
    throw new NotFoundError('requested membership not found');
  }

  return membership;
};

export default getOneMembership;
