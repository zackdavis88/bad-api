import { Project, User } from 'src/models';
import { DashboardProjectData } from 'src/server/types';
import { PaginationData } from 'src/controllers/validationUtils';
import Sequelize, { WhereOptions } from 'sequelize';
import { Request } from 'express';

type GetUserProjects = (
  user: User,
  paginationData: PaginationData,
  queryString: Request['query'],
) => Promise<DashboardProjectData[]>;

const getUserProjects: GetUserProjects = async (user, paginationData, queryString) => {
  const { itemsPerPage, pageOffset } = paginationData;
  const projectWhereOptions: WhereOptions = {
    isActive: true,
  };
  if (queryString.nameFilter) {
    projectWhereOptions.name = {
      [Sequelize.Op.iLike]: `%${queryString.nameFilter}%`,
    };
  }

  const membershipProjects = await user.getMemberships({
    limit: itemsPerPage,
    offset: pageOffset,
    order: [['createdOn', 'DESC']],
    include: [
      {
        model: Project,
        where: projectWhereOptions,
        as: 'project',
        required: true,
        include: [{ model: User, as: 'createdBy', where: { isActive: true } }],
      },
    ],
  });

  return membershipProjects.map(
    ({ project, isProjectAdmin, isProjectManager, isProjectDeveloper }) => {
      let role: DashboardProjectData['role'];
      if (isProjectAdmin) {
        role = 'Admin';
      } else if (isProjectManager) {
        role = 'Manager';
      } else if (isProjectDeveloper) {
        role = 'Developer';
      } else {
        role = 'Viewer';
      }

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        createdOn: project.createdOn,
        updatedOn: project.updatedOn,
        createdBy:
          project.createdById && project.createdBy ?
            {
              username: project.createdBy.username,
              displayName: project.createdBy.displayName,
            }
          : null,
        role,
      };
    },
  );
};

export default getUserProjects;
