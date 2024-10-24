import { default as create } from './create';
import { default as getAll } from './getAll';
import { default as getOne, getMembershipMiddleware } from './getOne';
import { default as update } from './update';
import { default as remove } from './remove';

export default {
  create,
  getAll,
  getOne,
  update,
  remove,
  getMembershipMiddleware,
};
