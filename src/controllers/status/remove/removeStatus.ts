import { Project, Status } from 'src/models';
import { StatusData } from 'src/server/types';

type RemoveStatus = (project: Project, status: Status) => Promise<StatusData>;

const removeStatus: RemoveStatus = async (project, status) => {
  await status.destroy();

  return {
    id: status.id,
    name: status.name,
    project: {
      id: project.id,
      name: project.name,
    },
  };
};

export default removeStatus;
