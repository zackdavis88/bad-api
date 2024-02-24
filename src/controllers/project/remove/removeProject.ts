import { Project, User } from 'src/models';
import { ProjectData } from 'src/server/types';

type RemoveProject = (project: Project, user: User) => Promise<ProjectData>;

const removeProject: RemoveProject = async (project, user) => {
  project.isActive = false;
  project.deletedOn = new Date();
  project.deletedById = user.id;
  await project.save();

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdOn: project.createdOn,
    createdBy:
      project.createdBy ?
        {
          username: project.createdBy.username,
          displayName: project.createdBy.displayName,
        }
      : undefined,
    updatedOn: project.updatedOn,
    updatedBy:
      project.updatedBy ?
        {
          username: project.updatedBy.username,
          displayName: project.updatedBy.displayName,
        }
      : undefined,
    deletedOn: project.deletedOn,
    deletedBy: {
      username: user.username,
      displayName: user.displayName,
    },
  };
};

export default removeProject;
