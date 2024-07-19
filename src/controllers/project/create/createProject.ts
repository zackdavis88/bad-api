import { User, Project, Status } from 'src/models';
import { ProjectData } from 'src/server/types';
import { DEFAULT_PROJECT_STATUSES } from 'src/config/app';

interface DefaultStatusData {
  name: Status['name'];
  projectId: Status['projectId'];
}

type CreateProject = (
  user: User,
  name: string,
  description: string,
  createDefaultStatuses: boolean,
) => Promise<ProjectData>;

const createProject: CreateProject = async (
  user,
  name,
  description,
  createDefaultStatuses,
) => {
  const newProject = await Project.create({
    name,
    description,
    createdById: user.id,
  });

  // Create a new admin membership for the project owner.
  await newProject.createMembership({
    userId: user.id,
    isProjectAdmin: true,
    createdById: user.id,
  });

  // Create default statuses if requested
  if (
    createDefaultStatuses &&
    Array.isArray(DEFAULT_PROJECT_STATUSES) &&
    DEFAULT_PROJECT_STATUSES.length
  ) {
    // Since DEFAULT_PROJECT_STATUSES is ultimately user defined, we are only going to create
    // statuses that are of type string; anything else is ignored.
    await Status.bulkCreate(
      [...new Set(DEFAULT_PROJECT_STATUSES)].reduce<DefaultStatusData[]>(
        (statuses, statusName) => {
          if (typeof statusName === 'string') {
            return statuses.concat({
              name: statusName,
              projectId: newProject.id,
            });
          }

          return statuses;
        },
        [],
      ),
    );
  }

  return {
    id: newProject.id,
    name: newProject.name,
    description: newProject.description,
    createdOn: newProject.createdOn,
    createdBy: {
      username: user.username,
      displayName: user.displayName,
    },
  };
};

export default createProject;
