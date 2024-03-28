import { Project, User, Membership, Status } from 'src/models';
import { NotFoundError } from 'src/server/utils/errors';
import { Includeable } from 'sequelize';

type GetOneProject = (projectId: string, authUser: User) => Promise<Project>;

const getOneProject: GetOneProject = async (projectId, authUser) => {
  let include: Includeable[] = [
    { model: User.scope('publicAttributes'), as: 'createdBy', required: false },
    { model: User.scope('publicAttributes'), as: 'updatedBy', required: false },
    { model: Status, as: 'statuses', required: false },
  ];
  if (authUser) {
    include = include.concat({
      model: Membership,
      as: 'authUserMembership',
      required: false,
      where: { userId: authUser.id },
    });
  }

  const project = await Project.findOne({
    where: { id: projectId, isActive: true },
    include,
  });

  if (!project) {
    throw new NotFoundError('requested project not found');
  }

  return project;
};

export default getOneProject;
