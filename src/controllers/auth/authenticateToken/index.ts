import { NextFunction, Request, Response } from 'express';
import authenticateTokenValidation from './authenticateTokenValidation';
import authenticateToken from './authenticateToken';
import { DatabaseError } from 'sequelize';
import { ValidationError } from 'src/server/utils/errors';

const authenticateTokenFlow = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['x-auth-token']
    ? req.headers['x-auth-token'].toString()
    : '';

  try {
    const { userId, apiKey } = authenticateTokenValidation(authHeader);
    const user = await authenticateToken(userId, apiKey);

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.sendError(new ValidationError('x-auth-token contains an invalid value'));
    }

    return res.sendError(error);
  }
};

export default authenticateTokenFlow;
