import { Request, Response } from 'express';
import removeProjectValidation from './removeProjectValidation';
import removeProject from './removeProject';

interface RemoveProjectRequestBody {
  confirm: unknown;
}

const removeProjectFlow = async (
  req: Request<never, never, RemoveProjectRequestBody>,
  res: Response,
) => {
  const { confirm } = req.body;
  const project = req.project;
  const user = req.user;
  try {
    removeProjectValidation(project, confirm);
    const projectData = await removeProject(project, user);
    return res.success('project has been successfully removed', { project: projectData });
  } catch (error) {
    return res.sendError(error);
  }
};

export default removeProjectFlow;
