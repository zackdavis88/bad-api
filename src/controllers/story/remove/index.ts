import { Request, Response } from 'express';
import removeStoryValidation from './removeStoryValidation';
import removeStory from './removeStory';

interface RemoveStoryRequestBody {
  confirm: unknown;
}

const removeStoryFlow = async (
  req: Request<never, never, RemoveStoryRequestBody>,
  res: Response,
) => {
  try {
    const { project, story } = req;
    const { confirm } = req.body;
    removeStoryValidation(confirm);
    const storyData = await removeStory(project, story);
    return res.success('story has been successfully removed', {
      story: storyData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default removeStoryFlow;
