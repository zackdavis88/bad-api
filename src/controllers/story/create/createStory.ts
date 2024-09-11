import { Project, User, Status } from 'src/models';
import { StoryData } from 'src/server/types';

type CreateStory = (
  project: Project,
  user: User,
  title: string,
  details: string,
  status?: Status | null,
) => Promise<StoryData>;

const createStory: CreateStory = async (project, user, title, details, status) => {
  const story = await project.createStory({
    title,
    details,
    statusId: status?.id,
    createdById: user.id,
  });

  return {
    id: story.id,
    title: story.title,
    details: story.details,
    status:
      status ?
        {
          id: status.id,
          name: status.name,
        }
      : null,
    project: {
      id: project.id,
      name: project.name,
    },
    createdOn: story.createdOn,
    createdBy: {
      username: user.username,
      displayName: user.displayName,
    },
  };
};

export default createStory;
