import { Request, Response } from 'express';
import createUserValidation from './createUserValidation';
import createUser from './createUser';
import { ValidationError } from 'src/controllers/validationUtils';

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
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.validationError(error.message);
    }
    return res.fatalError('fatal error while validating user create input');
  }

  try {
    const userData = await createUser(username as string, password as string);
    return res.success('user has been successfully created', { user: userData });
  } catch {
    return res.fatalError('fatal error while creating user');
  }
};

export default createUserFlow;
