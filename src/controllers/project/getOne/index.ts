import { Request, Response, NextFunction } from 'express';
import getOneProjectValidation from './getOneProjectValidation';
import getOneProject from './getOneProject';

/*
  retrieving a projects data is something that will be used for many routes,
  this reusable middleware should work for all routes with a :projectId slug.
*/
export const getProjectMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    getOneProjectValidation(req.params.projectId);
    const project = await getOneProject(req.params.projectId, req.user);
    req.project = project;
    next();
  } catch (error) {
    return res.sendError(error);
  }
};

// This is used to return a requested projects details on GET /projects/:projectId
const getOneProjectFlow = async (req: Request, res: Response) => {
  const {
    id,
    name,
    description,
    createdOn,
    createdBy,
    createdById,
    updatedOn,
    updatedBy,
    updatedById,
  } = req.project;
  return res.success('project has been successfully retrieved', {
    project: {
      id,
      name,
      description,
      createdOn,
      createdBy:
        createdById && createdBy ?
          {
            displayName: createdBy.displayName,
            username: createdBy.username,
          }
        : null,
      updatedOn,
      updatedBy:
        updatedById && updatedBy ?
          {
            displayName: updatedBy.displayName,
            username: updatedBy.username,
          }
        : null,
      membershipCount: await req.project.countMemberships(),
    },
  });
};

export default getOneProjectFlow;
