import { Request, Response } from 'express';
import getOneUser from './getOneUser';

const getOneUserFlow = async (req: Request, res: Response) => {
  try {
    const userData = await getOneUser(req.params.username);
    return res.success('user has been successfully retrieved', { user: userData });
  } catch (error) {
    return res.sendError(error);
  }
};

export default getOneUserFlow;
