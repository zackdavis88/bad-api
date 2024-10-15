import { Project, User } from 'src/models';
import { DashboardProjectData } from 'src/server/types';
import { PaginationData } from 'src/controllers/validationUtils';

type GetUserProjects = (
  user: User,
  paginationData: PaginationData,
) => Promise<DashboardProjectData[]>;

const getUserProjects: GetUserProjects = async (user, paginationData) => {
  const { itemsPerPage, pageOffset } = paginationData;
  const membershipProjects = await user.getMemberships({
    limit: itemsPerPage,
    offset: pageOffset,
    order: [['createdOn', 'ASC']],
    include: [
      {
        model: Project,
        where: { isActive: true },
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
