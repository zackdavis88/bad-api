import { Project, Story } from 'src/models';
import { StoryData } from 'src/server/types';

type RemoveStory = (project: Project, story: Story) => Promise<StoryData>;

const removeStory: RemoveStory = async (project, story) => {
  await story.destroy();

  return {
    id: story.id,
    title: story.title,
    details: story.details,
    status:
      story.statusId && story.status ?
        {
          id: story.status.id,
          name: story.status.name,
        }
      : null,
    ownedBy:
      story.ownedById && story.ownedBy ?
        {
          username: story.ownedBy.username,
          displayName: story.ownedBy.displayName,
        }
      : null,
    project: {
      id: project.id,
      name: project.name,
    },
    createdOn: story.createdOn,
    updatedOn: story.updatedOn,
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
  };
};

export default removeStory;
