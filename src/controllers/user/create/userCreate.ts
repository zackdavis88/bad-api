import { User } from 'src/models';

type UserCreate = (
  username: string,
  password: string,
) => Promise<{ displayName: string; username: string; createdOn: Date }>;

const userCreate: UserCreate = async (username, password) => {
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

export default userCreate;
