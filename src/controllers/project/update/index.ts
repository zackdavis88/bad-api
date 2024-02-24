import { Request, Response } from 'express';
import updateProjectValidation from './updateProjectValidation';
import updateProject from './updateProject';

interface UpdateProjectRequestBody {
  name: unknown;
  description: unknown;
}

const updateProjectFlow = async (
  req: Request<never, never, UpdateProjectRequestBody>,
  res: Response,
) => {
  const { name, description } = req.body;
  try {
    updateProjectValidation(name, description);
    const projectData = await updateProject(req.user, req.project, name, description);
    return res.success('project has been successfully updated', { project: projectData });
  } catch (error) {
    return res.sendError(error);
  }
};

export default updateProjectFlow;
