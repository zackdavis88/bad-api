import { Project } from 'src/models';
import { StatusData } from 'src/server/types';

type CreateStatus = (project: Project, name: string) => Promise<StatusData>;

const createStatus: CreateStatus = async (project, name) => {
  const status = await project.createStatus({ name });

  return {
    id: status.id,
    name: status.name,
    project: {
      id: project.id,
      name: project.name,
    },
  };
};

export default createStatus;
