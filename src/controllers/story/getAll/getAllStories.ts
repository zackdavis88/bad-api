import { PaginationData } from 'src/controllers/validationUtils';
import { Project, Status, User } from 'src/models';
import { StoryData } from 'src/server/types';

type GetAllStories = (
  project: Project,
  paginationData: PaginationData,
) => Promise<Omit<StoryData, 'project' | 'details'>[]>;

const getAllStories: GetAllStories = async (project, paginationData) => {
  const { itemsPerPage, pageOffset } = paginationData;
  const stories = await project.getStories({
    limit: itemsPerPage,
    offset: pageOffset,
    order: [['createdOn', 'ASC']],
    include: [
      { model: User.scope('publicAttributes'), as: 'ownedBy', required: false },
      { model: User.scope('publicAttributes'), as: 'updatedBy', required: false },
      { model: User.scope('publicAttributes'), as: 'createdBy', required: false },
      { model: Status, as: 'status', required: false },
    ],
    attributes: {
      exclude: ['details'],
    },
  });

  return stories.map((story) => ({
    id: story.id,
    title: story.title,
    ownedBy:
      story.ownedById && story.ownedBy ?
        {
          username: story.ownedBy.username,
          displayName: story.ownedBy.displayName,
        }
      : null,
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
    status:
      story.statusId && story.status ?
        {
          id: story.status.id,
          name: story.status.name,
        }
      : null,
  }));
};

export default getAllStories;
