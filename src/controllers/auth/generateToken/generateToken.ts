import jwt from 'jsonwebtoken';
import { User } from 'src/models';
import { SECRET } from 'src/config/auth';
import { AuthenticationError } from 'src/controllers/validation_utils';
import { UserData } from 'src/server/types';

interface UserDataWithToken extends UserData {
  token: string;
}

type GenerateToken = (username: string, password: string) => Promise<UserDataWithToken>;

const generateToken: GenerateToken = async (username, password) => {
  const user = await User.findOne({
    where: {
      username: username.toLowerCase(),
      isActive: true,
    },
  });

  if (!user) {
    throw new AuthenticationError('username and password combination is invalid');
  }

  if (!user.compareHash(password)) {
    throw new AuthenticationError('username and password combination is invalid');
  }

  const tokenData = {
    id: user.id,
    apiKey: user.apiKey,
  };

  const jwtOptions = { expiresIn: '10h' };
  const token = jwt.sign(tokenData, SECRET, jwtOptions);

  return {
    token,
    username: user.username,
    displayName: user.displayName,
    createdOn: user.createdOn,
    updatedOn: user.updatedOn,
  };
};

export default generateToken;
