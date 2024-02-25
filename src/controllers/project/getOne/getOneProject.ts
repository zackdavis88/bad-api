import { Project, User, Membership } from 'src/models';
import { NotFoundError } from 'src/server/utils/errors';

type GetOneProject = (projectId: string, authUser: User) => Promise<Project>;

const getOneProject: GetOneProject = async (projectId, authUser) => {
  const project = await Project.findOne({
    where: { id: projectId, isActive: true },
    include: [
      { model: User.scope('publicAttributes'), as: 'createdBy' },
      { model: User.scope('publicAttributes'), as: 'updatedBy' },
      {
        model: Membership,
        as: 'authUserMembership',
        required: false,
        where: { userId: authUser.id },
      },
    ],
  });

  if (!project) {
    throw new NotFoundError('requested project not found');
  }

  return project;
};

export default getOneProject;
