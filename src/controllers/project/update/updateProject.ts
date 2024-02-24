import { User, Project } from 'src/models';
import { ProjectData } from 'src/server/types';

type UpdateProject = (
  user: User,
  project: Project,
  name: unknown,
  description: unknown,
) => Promise<ProjectData>;

const updateProject: UpdateProject = async (user, project, name, description) => {
  if (name && typeof name === 'string') {
    project.name = name;
  }

  if (description && typeof description === 'string') {
    project.description = description;
  } else if (description === '' || description === null) {
    project.description = null;
  }

  project.updatedOn = new Date();
  project.updatedById = user.id;
  await project.save();

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdOn: project.createdOn,
    createdBy:
      project.createdById && project.createdBy ?
        {
          username: project.createdBy.username,
          displayName: project.createdBy.displayName,
        }
      : null,
    updatedOn: project.updatedOn,
    updatedBy: {
      username: user.username,
      displayName: user.displayName,
    },
  };
};

export default updateProject;
