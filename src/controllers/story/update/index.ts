import { Request, Response } from 'express';
import updateStoryValidation from './updateStoryValidation';
import updateStory from './updateStory';

interface UpdateStoryRequestBody {
  title: unknown;
  details: unknown;
  status: unknown;
  ownedBy: unknown;
}

const updateStoryFlow = async (
  req: Request<never, never, UpdateStoryRequestBody>,
  res: Response,
) => {
  try {
    const project = req.project;
    const story = req.story;
    const user = req.user;
    const { title, details, status, ownedBy } = req.body;

    const { status: validatedStatus, ownedBy: validatedOwnedBy } =
      await updateStoryValidation(project, title, details, status, ownedBy);

    const storyData = await updateStory(
      story,
      user,
      title as string,
      details as string,
      status as string,
      validatedOwnedBy,
    );

    return res.success('story has been successfully updated', {
      story: {
        ...storyData,
        project: {
          id: project.id,
          name: project.name,
        },
        status:
          status && validatedStatus ?
            {
              id: validatedStatus.id,
              name: validatedStatus.name,
            }
          : null,
        ownedBy:
          ownedBy && validatedOwnedBy ?
            {
              username: validatedOwnedBy.username,
              displayName: validatedOwnedBy.displayName,
            }
          : null,
      },
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default updateStoryFlow;
