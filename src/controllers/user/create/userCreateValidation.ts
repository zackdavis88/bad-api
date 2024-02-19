import { validateUsername, validatePassword } from 'src/controllers/user/validationUtils';

type UserCreateValidation = (username: unknown, password: unknown) => Promise<void>;

const userCreateValidation: UserCreateValidation = async (username, password) => {
  await validateUsername(username);
  validatePassword(password);
};

export default userCreateValidation;
