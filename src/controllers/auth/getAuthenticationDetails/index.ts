import { Request, Response } from 'express';

const getAuthenticationDetails = (req: Request, res: Response) => {
  const { username, displayName, createdOn, updatedOn } = req.user;
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
