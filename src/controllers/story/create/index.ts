import { Request, Response } from 'express';
import createStoryValidation from './createStoryValidation';
import createStory from './createStory';

interface CreateStoryRequestBody {
  title: unknown;
  details: unknown;
  statusId: unknown;
}

const createStoryFlow = async (
  req: Request<never, never, CreateStoryRequestBody>,
  res: Response,
) => {
  try {
    const project = req.project;
    const user = req.user;
    const { title, details, statusId } = req.body;

    const validatedStatus = await createStoryValidation(
      project,
      title,
      details,
      statusId,
    );

    const storyData = await createStory(
      project,
      user,
      title as string,
      details as string,
      validatedStatus,
    );

    return res.success('story has been successfully created', {
      story: storyData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default createStoryFlow;
