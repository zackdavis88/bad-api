import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { SECRET } from 'src/config/auth';
import { ValidationError } from 'src/controllers/validationUtils';

type AuthenticateTokenValidation = (header: string) => {
  userId: string;
  apiKey: string;
};

const authenticateTokenValidation: AuthenticateTokenValidation = (header) => {
  if (!header) {
    throw new ValidationError('x-auth-token header is missing from input');
  }

  try {
    const tokenData = jwt.verify(header, SECRET);
    if (typeof tokenData === 'string') {
      throw new ValidationError('x-auth-token is invalid');
    }

    const userId = tokenData.id;
    const apiKey = tokenData.apiKey;

    if (!userId || !apiKey) {
      throw new ValidationError('x-auth-token is missing required fields');
    }

    return { userId, apiKey };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new ValidationError('x-auth-token is expired');
    }

    if (error instanceof JsonWebTokenError) {
      throw new ValidationError('x-auth-token is invalid');
    }

    throw error;
  }
};

export default authenticateTokenValidation;
