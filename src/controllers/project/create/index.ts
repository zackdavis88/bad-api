import { Request, Response } from 'express';
import createProjectValidation from './createProjectValidation';
import createProject from './createProject';

interface CreateProjectRequestBody {
  name: unknown;
  description: unknown;
}

const createProjectFlow = async (
  req: Request<never, never, CreateProjectRequestBody>,
  res: Response,
) => {
  const { name, description } = req.body;
  const user = req.user;
  const createDefaultStatuses =
    typeof req.query.createDefaultStatuses === 'string' &&
    req.query.createDefaultStatuses.toLocaleLowerCase() === 'true';

  try {
    createProjectValidation(name, description);
    const projectData = await createProject(
      user,
      name as string,
      description as string,
      createDefaultStatuses,
    );
    return res.success('project has been successfully created', {
      project: projectData,
    });
  } catch (error) {
    return res.sendError(error);
  }
};

export default createProjectFlow;
