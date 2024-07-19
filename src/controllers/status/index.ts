import { default as getAll } from './getAll';
import { default as create } from './create';
import { default as getOne, getStatusMiddleware } from './getOne';

export default {
  create,
  getAll,
  getOne,
  getStatusMiddleware,
};
