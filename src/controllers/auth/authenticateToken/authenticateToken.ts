import { User } from 'src/models';
import { AuthenticationError } from 'src/server/utils/errors';

type AuthenticateToken = (userId: string, apiKey: string) => Promise<User>;

const authenticateToken: AuthenticateToken = async (userId, apiKey) => {
  const user = await User.findOne({
    where: {
      id: userId,
      apiKey,
      isActive: true,
    },
  });

  if (!user) {
    throw new AuthenticationError('x-auth-token user could not be authenticated');
  }

  return user;
};

export default authenticateToken;
