import { Project, User } from 'src/models';
import { NotFoundError } from 'src/server/utils/errors';

type GetOneProject = (projectId: string) => Promise<Project>;

const getOneProject: GetOneProject = async (projectId) => {
  const project = await Project.findOne({
    where: { id: projectId, isActive: true },
    include: [
      { model: User.scope('publicAttributes'), as: 'createdBy' },
      { model: User.scope('publicAttributes'), as: 'updatedBy' },
    ],
  });

  if (!project) {
    throw new NotFoundError('requested project not found');
  }

  return project;
};

export default getOneProject;
