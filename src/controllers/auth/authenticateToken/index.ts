import { NextFunction, Request, Response } from 'express';
import authenticateTokenValidation from './authenticateTokenValidation';
import authenticateToken from './authenticateToken';
import { ValidationError, AuthenticationError } from 'src/controllers/validationUtils';
import { DatabaseError } from 'sequelize';

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
    if (error instanceof ValidationError) {
      return res.validationError(error.message);
    }

    if (error instanceof AuthenticationError) {
      return res.authenticationError(error.message);
    }

    if (error instanceof DatabaseError) {
      return res.validationError('x-auth-token contains an invalid value');
    }

    return res.fatalError('fatal error while authenticating token');
  }
};

export default authenticateTokenFlow;
