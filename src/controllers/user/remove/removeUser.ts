import { User } from 'src/models';
import { UserData } from 'src/server/types';

type RemoveUser = (user: User) => Promise<UserData>;

const removeUser: RemoveUser = async (user) => {
  user.isActive = false;
  user.deletedOn = new Date();
  await user.save();

  return {
    username: user.username,
    displayName: user.displayName,
    createdOn: user.createdOn,
    updatedOn: user.updatedOn,
    deletedOn: user.deletedOn,
  };
};

export default removeUser;
