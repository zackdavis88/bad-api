import { User } from 'src/models';
import { UserData } from 'src/server/types';

interface DeleteUserData extends UserData {
  deletedOn: Date;
}

type RemoveUser = (user: User) => Promise<DeleteUserData>;

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
