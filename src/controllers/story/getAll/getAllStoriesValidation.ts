import { Request } from 'express';
import { Project } from 'src/models';
import { validatePagination, PaginationData } from 'src/controllers/validationUtils';

type GetAllStoriesValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllStoriesValiation: GetAllStoriesValidation = async (project, queryString) => {
  const storiesCount = await project.countStories();
  return validatePagination(queryString, storiesCount);
};

export default getAllStoriesValiation;
