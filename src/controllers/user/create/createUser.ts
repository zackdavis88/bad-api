import { User } from 'src/models';
import { UserData } from 'src/server/types';

type CreateUser = (username: string, password: string) => Promise<UserData>;

const createUser: CreateUser = async (username, password) => {
  const newUser = await User.create({
    username: username.toLowerCase(),
    displayName: username,
    hash: User.generateHash(password),
  });

  const userData = {
    displayName: newUser.displayName,
    username: newUser.username,
    createdOn: newUser.createdOn,
  };

  return userData;
};

export default createUser;
