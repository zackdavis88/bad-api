import { Request, Response } from 'express';
import removeUserValidation from './removeUserValidation';
import removeUser from './removeUser';

interface RemoveUserRequestBody {
  confirm: unknown;
}

const removeUserFlow = async (
  req: Request<never, never, RemoveUserRequestBody>,
  res: Response,
) => {
  const { confirm } = req.body;
  const user = req.user;

  try {
    removeUserValidation(user, confirm);
    const userData = await removeUser(user);

    return res.success('user has been successfully removed', { user: userData });
  } catch (error) {
    return res.sendError(error);
  }
};

export default removeUserFlow;
