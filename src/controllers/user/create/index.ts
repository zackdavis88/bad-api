import { Request, Response } from 'express';
import userCreateValidation from './userCreateValidation';
import userCreate from './userCreate';
import { ValidationError } from 'src/controllers/validation_utils';

interface UserCreateRequestBody {
  username: unknown;
  password: unknown;
}

const userCreateFlow = async (
  req: Request<never, never, UserCreateRequestBody>,
  res: Response,
) => {
  const { username, password } = req.body;

  try {
    await userCreateValidation(username, password);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.validationError(error.message);
    }
    return res.fatalError('fatal error while validating user create input');
  }

  try {
    const userData = await userCreate(username as string, password as string);
    return res.success('user has been successfully created', { user: userData });
  } catch {
    return res.fatalError('fatal error while creating user');
  }
};

export default userCreateFlow;
