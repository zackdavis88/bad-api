import { Project, User } from 'src/models';
import { PaginationData } from 'src/controllers/validationUtils';
import { ProjectData } from 'src/server/types';

type GetAllProjects = (paginationData: PaginationData) => Promise<ProjectData[]>;

const getAllProjects: GetAllProjects = async (paginationData) => {
  const { itemsPerPage, pageOffset } = paginationData;
  const projects = await Project.findAll({
    where: { isActive: true },
    limit: itemsPerPage,
    offset: pageOffset,
    order: [['createdOn', 'ASC']],
    include: [
      { model: User.scope('publicAttributes'), as: 'createdBy', required: false },
      { model: User.scope('publicAttributes'), as: 'updatedBy', required: false },
    ],
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    createdOn: project.createdOn,
    createdBy:
      project.createdById && project.createdBy ?
        {
          displayName: project.createdBy.displayName,
          username: project.createdBy.username,
        }
      : null,
    updatedOn: project.updatedOn,
    updatedBy:
      project.updatedById && project.updatedBy ?
        {
          displayName: project.updatedBy.displayName,
          username: project.updatedBy.username,
        }
      : null,
  }));
};

export default getAllProjects;
