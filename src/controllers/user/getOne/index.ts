import { Request, Response } from 'express';
import { NotFoundError } from 'src/controllers/validation_utils';
import getOneUser from './getOneUser';

const getOneUserFlow = async (req: Request, res: Response) => {
  try {
    const userData = await getOneUser(req.params.username);
    return res.success('user has been successfully retrieved', { user: userData });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.notFoundError(error.message);
    }

    return res.fatalError('fatal error while getting user details');
  }
};

export default getOneUserFlow;
