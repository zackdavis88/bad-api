import { Request, Response, NextFunction } from 'express';
import getOneStoryValidation from './getOneStoryValidation';
import getOneStory from './getOneStory';

export const getStoryMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const project = req.project;
    getOneStoryValidation(req.params.storyId);
    const story = await getOneStory(project, req.params.storyId);
    req.story = story;
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

const getOneStoryFlow = async (req: Request, res: Response) => {
  const project = req.project;
  const story = req.story;

  const storyData = {
    id: story.id,
    title: story.title,
    details: story.details,
    createdOn: story.createdOn,
    updatedOn: story.updatedOn,
    project: {
      id: project.id,
      name: project.name,
    },
    createdBy:
      story.createdById && story.createdBy ?
        {
          username: story.createdBy.username,
          displayName: story.createdBy.displayName,
        }
      : null,
    updatedBy:
      story.updatedById && story.updatedBy ?
        {
          username: story.updatedBy.username,
          displayName: story.updatedBy.displayName,
        }
      : null,
    ownedBy:
      story.ownedById && story.ownedBy ?
        {
          username: story.ownedBy.username,
          displayName: story.ownedBy.displayName,
        }
      : null,
    status:
      story.statusId && story.status ?
        {
          id: story.status.id,
          name: story.status.name,
        }
      : null,
  };

  return res.success('story has been successfully retrieved', {
    story: storyData,
  });
};

export default getOneStoryFlow;
