import { Project, Status } from 'src/models';
import { NotFoundError } from 'src/server/utils/errors';

type GetOneStatus = (project: Project, statusId: string) => Promise<Status>;

const getOneStatus: GetOneStatus = async (project, statusId) => {
  const status = await project.getStatus({
    where: { id: statusId },
  });

  if (!status) {
    throw new NotFoundError('requested status not found');
  }

  return status;
};

export default getOneStatus;
