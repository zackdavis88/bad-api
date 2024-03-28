import { Project } from 'src/models';
import { StatusData } from 'src/server/types';

type GetAllStatuses = (project: Project) => Promise<Omit<StatusData, 'project'>[]>;

const getAllStatuses: GetAllStatuses = async (project) => {
  if (!project.statuses) {
    return [];
  }

  return project.statuses.map((status) => ({
    id: status.id,
    name: status.name,
  }));
};

export default getAllStatuses;
