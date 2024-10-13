import { Story, User } from 'src/models';
import { StoryData } from 'src/server/types';

type UpdateStory = (
  project: Story,
  user: User,
  title: string,
  details: string,
  statusId?: string | null,
  ownedBy?: User | null,
) => Promise<Omit<StoryData, 'project'>>;

const updateStory: UpdateStory = async (
  story,
  user,
  title,
  details,
  statusId,
  ownedBy,
) => {
  if (title) {
    story.title = title;
  }

  if (details) {
    story.details = details;
  } else if (details === '' || details === null) {
    story.details = null;
  }

  if (statusId) {
    story.statusId = statusId;
  } else if (statusId === null) {
    story.statusId = null;
  }

  if (ownedBy) {
    story.ownedById = ownedBy.id;
  } else if (ownedBy === null) {
    story.ownedById = null;
  }

  story.updatedOn = new Date();
  story.updatedById = user.id;

  await story.save();

  return {
    id: story.id,
    title: story.title,
    details: story.details,
    createdOn: story.createdOn,
    createdBy:
      story.createdBy ?
        {
          username: story.createdBy.username,
          displayName: story.createdBy.displayName,
        }
      : null,
    updatedOn: story.updatedOn,
    updatedBy: {
      username: user.username,
      displayName: user.displayName,
    },
  };
};

export default updateStory;
