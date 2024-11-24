import { Request } from 'express';
import { Project } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';
import { Op, WhereOptions } from 'sequelize';

type GetAllStoriesValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllStoriesValiation: GetAllStoriesValidation = async (project, queryString) => {
  let whereOptions: WhereOptions | undefined = undefined;
  const titleFilter = queryString.titleFilter;
  if (titleFilter) {
    whereOptions = {
      title: {
        [Op.iLike]: `%${titleFilter}%`,
      },
    };
  }

  const storiesCount = await project.countStories({ where: whereOptions });
  return validatePagination(queryString, storiesCount);
};

export default getAllStoriesValiation;
