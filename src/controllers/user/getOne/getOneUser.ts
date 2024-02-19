import { User } from 'src/models';
import { NotFoundError } from 'src/controllers/validation_utils';
import { UserData } from 'src/server/types';

type GetOneUser = (username: string) => Promise<UserData>;

const getOneUser: GetOneUser = async (username) => {
  const requestedUser = await User.findOne({
    where: {
      username: username.toLowerCase(),
      isActive: true,
    },
  });

  if (!requestedUser) {
    throw new NotFoundError('requested user not found');
  }

  return {
    username: requestedUser.username,
    displayName: requestedUser.displayName,
    createdOn: requestedUser.createdOn,
    updatedOn: requestedUser.updatedOn,
  };
};

export default getOneUser;
