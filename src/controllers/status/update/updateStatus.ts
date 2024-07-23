import { Project, Status } from 'src/models';
import { StatusData } from 'src/server/types';

type UpdateStatus = (
  project: Project,
  status: Status,
  name: string,
) => Promise<StatusData>;

const updateStatus: UpdateStatus = async (project, status, name) => {
  status.name = name;
  await status.save();
  return {
    id: status.id,
    name: status.name,
    project: {
      id: project.id,
      name: project.name,
    },
  };
};

export default updateStatus;
