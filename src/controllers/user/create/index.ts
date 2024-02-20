import { Request, Response } from 'express';
import createUserValidation from './createUserValidation';
import createUser from './createUser';

interface CreateUserRequestBody {
  username: unknown;
  password: unknown;
}

const createUserFlow = async (
  req: Request<never, never, CreateUserRequestBody>,
  res: Response,
) => {
  const { username, password } = req.body;

  try {
    await createUserValidation(username, password);
    const userData = await createUser(username as string, password as string);
    return res.success('user has been successfully created', { user: userData });
  } catch (error) {
    return res.sendError(error);
  }
};

export default createUserFlow;
