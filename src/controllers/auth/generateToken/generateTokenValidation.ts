import { ValidationError } from 'src/server/utils/errors';

type BasicHeaderValidation = (header: string) => {
  username: string;
  password: string;
};

const basicHeaderValidation: BasicHeaderValidation = (header) => {
  if (!header) {
    throw new ValidationError('x-auth-basic header is missing from input');
  }

  const encodedRegex = new RegExp('^Basic .+$');
  if (!encodedRegex.test(header)) {
    throw new ValidationError('x-auth-basic must use Basic Auth');
  }

  const headerSplit = header.split(' ');
  const encodedCredentials = Buffer.from(headerSplit[1], 'base64');
  const decodedCredentials = encodedCredentials.toString('ascii');

  const decodedRegex = new RegExp('^[A-Za-z0-9-_]+[:].*$');
  if (!decodedRegex.test(decodedCredentials)) {
    throw new ValidationError('x-auth-basic credentials have invalid format');
  }

  const [username, password] = decodedCredentials.split(/:(.*)/);
  return {
    username,
    password,
  };
};

export default basicHeaderValidation;
