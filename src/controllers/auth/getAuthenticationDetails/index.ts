import { Request, Response } from 'express';
import signJwtToken from 'src/controllers/auth/utils/signJwtToken';

const getAuthenticationDetails = (req: Request, res: Response) => {
  const { username, displayName, createdOn, updatedOn } = req.user;

  const refreshedToken = signJwtToken(req.user);

  res.set('x-auth-token', refreshedToken);
  return res.success('user successfully authenticated via token', {
    user: {
      username,
      displayName,
      createdOn,
      updatedOn,
    },
  });
};

export default getAuthenticationDetails;
