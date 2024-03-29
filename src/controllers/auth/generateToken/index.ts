import { Request, Response } from 'express';
import generateTokenValidation from './generateTokenValidation';
import generateToken from './generateToken';

const generateTokenFlow = async (req: Request, res: Response) => {
  const authHeader = req.headers['x-auth-basic']
    ? req.headers['x-auth-basic'].toString()
    : '';

  try {
    const { username, password } = generateTokenValidation(authHeader);
    const { token, ...userData } = await generateToken(username, password);

    res.set('x-auth-token', token);
    return res.success('user successfully authenticated', { user: userData });
  } catch (error) {
    return res.sendError(error);
  }
};

export default generateTokenFlow;
