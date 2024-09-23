import { Project, Story, User, Status } from 'src/models';
import { NotFoundError } from 'src/server/utils/errors';

type GetOneStory = (project: Project, storyId: string) => Promise<Story>;

const getOneStory: GetOneStory = async (project, storyId) => {
  const story = await project.getStory({
    where: { id: storyId },
    include: [
      { model: User.scope('publicAttributes'), as: 'ownedBy', required: false },
      { model: User.scope('publicAttributes'), as: 'updatedBy', required: false },
      { model: User.scope('publicAttributes'), as: 'createdBy', required: false },
      { model: Status, as: 'status', required: false },
    ],
  });

  if (!story) {
    throw new NotFoundError('requested story not found');
  }

  return story;
};

export default getOneStory;
