import { Request, Response } from 'express';
import updateUserValidation from './updateUserValidation';
import updateUser from './updateUser';

interface UpdateUserRequestBody {
  newPassword: unknown;
  currentPassword: unknown;
}

const updateUserFlow = async (
  req: Request<never, never, UpdateUserRequestBody>,
  res: Response,
) => {
  const { newPassword, currentPassword } = req.body;
  const user = req.user;
  try {
    updateUserValidation(user, newPassword, currentPassword);
    const userData = await updateUser(user, newPassword as string);

    return res.success('user has been successfully updated', { user: userData });
  } catch (error) {
    return res.sendError(error);
  }
};

export default updateUserFlow;
