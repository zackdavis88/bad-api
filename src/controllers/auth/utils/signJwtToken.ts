import jwt from 'jsonwebtoken';
import { User } from 'src/models';
import { SECRET } from 'src/config/auth';

type SignJwtToken = (user: User) => string;

const signJwtToken: SignJwtToken = (user) => {
  const tokenData = {
    id: user.id,
    apiKey: user.apiKey,
  };

  const jwtOptions = { expiresIn: '10h' };
  const token = jwt.sign(tokenData, SECRET, jwtOptions);

  return token;
};

export default signJwtToken;
