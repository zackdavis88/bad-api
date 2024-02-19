import { User } from 'src/models';
import { UserData } from 'src/server/types';

type UpdateUser = (user: User, newPassword: string) => Promise<UserData>;

const updateUser: UpdateUser = async (user, newPassword) => {
  user.hash = User.generateHash(newPassword);
  user.updatedOn = new Date();
  await user.save();

  return {
    username: user.username,
    displayName: user.displayName,
    createdOn: user.createdOn,
    updatedOn: user.updatedOn,
  };
};

export default updateUser;
