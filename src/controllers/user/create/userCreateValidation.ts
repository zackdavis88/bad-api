import {
  validateUsername,
  validatePassword,
} from 'src/controllers/user/validation_utils';

type UserCreateValidation = (username: unknown, password: unknown) => Promise<void>;

const userCreateValidation: UserCreateValidation = async (username, password) => {
  await validateUsername(username);
  validatePassword(password);
};

export default userCreateValidation;
