import { PaginationData } from 'src/controllers/validationUtils';
import { Project } from 'src/models';
import { StatusData } from 'src/server/types';

type GetAllStatuses = (
  project: Project,
  paginationData: PaginationData,
) => Promise<Omit<StatusData, 'project'>[]>;

const getAllStatuses: GetAllStatuses = async (project, paginationData) => {
  const { itemsPerPage, pageOffset } = paginationData;
  const statuses = await project.getStatuses({
    limit: itemsPerPage,
    offset: pageOffset,
  });

  return statuses.map((status) => ({
    id: status.id,
    name: status.name,
  }));
};

export default getAllStatuses;
