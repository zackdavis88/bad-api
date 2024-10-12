import { User } from 'src/models';
import { AuthenticationError } from 'src/server/utils/errors';
import { UserData } from 'src/server/types';
import signJwtToken from 'src/controllers/auth/utils/signJwtToken';

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

  const token = signJwtToken(user);

  return {
    token,
    username: user.username,
    displayName: user.displayName,
    createdOn: user.createdOn,
    updatedOn: user.updatedOn,
  };
};

export default generateToken;
