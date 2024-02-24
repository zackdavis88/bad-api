import { User, Project } from 'src/models';
import { ProjectData } from 'src/server/types';

type CreateProject = (
  user: User,
  name: string,
  description: string,
) => Promise<ProjectData>;

const createProject: CreateProject = async (user, name, description) => {
  const newProject = await Project.create({
    name,
    description,
    createdById: user.id,
  });

  await newProject.createMembership({
    userId: user.id,
    isProjectAdmin: true,
    createdById: user.id,
  });

  return {
    id: newProject.id,
    name: newProject.name,
    description: newProject.description,
    createdOn: newProject.createdOn,
    createdBy: {
      username: user.username,
      displayName: user.displayName,
    },
  };
};

export default createProject;
