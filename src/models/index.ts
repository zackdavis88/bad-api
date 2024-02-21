import { Sequelize } from 'sequelize';
import { User, initializeUser } from './user';
import { Project, initializeProject } from './project';

const synchronizeTables = async (sequelize: Sequelize) => {
  try {
    await sequelize.sync();
  } catch (error) {
    console.error('Error synchronizing models');
    console.error(error);
    throw error;
  }
};

export const initializeModels = (sequelize: Sequelize) => {
  initializeUser(sequelize);
  initializeProject(sequelize);

  /*  Sequelize is weird. These associations need to be done outside of the model files
   *  and after model initialization because of our code structure.
   */
  // Project associations
  User.hasMany(Project, { as: 'createdProjects', foreignKey: 'createdById' });
  Project.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

  User.hasMany(Project, { as: 'updatedProjects', foreignKey: 'updatedById' });
  Project.belongsTo(User, { as: 'updatedBy', foreignKey: 'updatedById' });

  User.hasMany(Project, { as: 'deletedProjects', foreignKey: 'deletedById' });
  Project.belongsTo(User, { as: 'deletedBy', foreignKey: 'deletedById' });
};

export const initializeModelsAndSync = async (sequelize: Sequelize) => {
  initializeModels(sequelize);
  await synchronizeTables(sequelize);
};

export { User } from './user';
export { Project } from './project';
