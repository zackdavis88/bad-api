import { Request, Response } from 'express';
import getAllStoriesValidation from './getAllStoriesValidation';
import getAllStories from './getAllStories';

const getAllStoriesFlow = async (req: Request, res: Response) => {
  try {
    const project = req.project;
    const paginationData = await getAllStoriesValidation(project, req.query);
    const stories = await getAllStories(project, paginationData);

    return res.success('story list has been successfully retrieved', {
      page: paginationData.page,
      totalItems: paginationData.totalItems,
      totalPages: paginationData.totalPages,
      itemsPerPage: paginationData.itemsPerPage,
      stories,
      project: {
        id: project.id,
        name: project.name,
      },
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default getAllStoriesFlow;
