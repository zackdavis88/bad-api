import { User, Project, Status } from 'src/models';
import { ProjectData } from 'src/server/types';
import { DEFAULT_PROJECT_STATUSES } from 'src/config/app';

interface DefaultStatusData {
  name: Status['name'];
  projectId: Status['projectId'];
  createdOn: Date;
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
        (statuses, statusName, index) => {
          if (typeof statusName === 'string') {
            return statuses.concat({
              name: statusName,
              projectId: newProject.id,
              /**
               * Dont fuck around and remove this createdOn data. It seems silly because createdOn is defaulted
               * and not required for creation but there is funky behavior with bulkCreate where every status
               * that gets made has the exact same timestamp, which leads to unexpected behavior when ordering
               * statuses by the createdOn column.
               *
               * I tried doing a simple new Date() but for some reason the issue persisted so I decided to take the approach
               * of adding the index to the timestamp to ensure everything comes out truly unique.
               */
              createdOn: new Date(new Date().getTime() + index),
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
