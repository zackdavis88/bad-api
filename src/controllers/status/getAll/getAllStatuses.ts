import { Request } from 'express';
import { PaginationData } from 'src/controllers/validationUtils';
import { Project } from 'src/models';
import { StatusData } from 'src/server/types';
import { Op, WhereOptions } from 'sequelize';

type GetAllStatuses = (
  project: Project,
  paginationData: PaginationData,
  queryString: Request['query'],
) => Promise<Omit<StatusData, 'project'>[]>;

const getAllStatuses: GetAllStatuses = async (project, paginationData, queryString) => {
  const { itemsPerPage, pageOffset } = paginationData;

  let whereOptions: WhereOptions | undefined = undefined;
  const nameFilter = queryString.nameFilter;
  if (nameFilter) {
    whereOptions = {
      name: {
        [Op.iLike]: `%${nameFilter}%`,
      },
    };
  }

  let createdOnOrder = 'ASC';
  if (
    typeof queryString.createdOnOrder === 'string' &&
    queryString.createdOnOrder.toUpperCase() === 'DESC'
  ) {
    createdOnOrder = 'DESC';
  }

  const statuses = await project.getStatuses({
    limit: itemsPerPage,
    offset: pageOffset,
    order: [['createdOn', createdOnOrder]],
    where: whereOptions,
  });

  return statuses.map((status) => ({
    id: status.id,
    name: status.name,
  }));
};

export default getAllStatuses;
