import { Request } from 'express';
import { Project } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';
import { Op, WhereOptions } from 'sequelize';

type GetAllStatusesValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllStatusesValiation: GetAllStatusesValidation = async (
  project,
  queryString,
) => {
  let whereOptions: WhereOptions | undefined = undefined;
  const nameFilter = queryString.nameFilter;
  if (nameFilter) {
    whereOptions = {
      name: {
        [Op.iLike]: `%${nameFilter}%`,
      },
    };
  }

  const statusesCount = await project.countStatuses({ where: whereOptions });
  return validatePagination(queryString, statusesCount);
};

export default getAllStatusesValiation;
