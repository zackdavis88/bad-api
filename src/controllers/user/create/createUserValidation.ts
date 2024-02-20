import { validateUsername, validatePassword } from 'src/controllers/user/validationUtils';

type CreateUserValidation = (username: unknown, password: unknown) => Promise<void>;

const createUserValidation: CreateUserValidation = async (username, password) => {
  await validateUsername(username);
  validatePassword(password);
};

export default createUserValidation;
