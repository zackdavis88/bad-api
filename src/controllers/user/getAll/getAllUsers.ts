import { User } from 'src/models';
import { PaginationData } from 'src/controllers/validationUtils';
import { UserData } from 'src/server/types';

type GetAllUsers = (paginationData: PaginationData) => Promise<UserData[]>;

const getAllUsers: GetAllUsers = async (paginationData) => {
  const { itemsPerPage, pageOffset } = paginationData;
  const users = await User.scope('publicAttributes').findAll({
    where: { isActive: true },
    limit: itemsPerPage,
    offset: pageOffset,
    order: [['createdOn', 'ASC']],
  });

  return users.map((user) => ({
    username: user.username,
    displayName: user.displayName,
    createdOn: user.createdOn,
  }));
};

export default getAllUsers;
