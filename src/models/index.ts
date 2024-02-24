import { Sequelize } from 'sequelize';
import { User, initializeUser } from './user';
import { Project, initializeProject } from './project';
import { Membership, initializeMembership } from './membership';

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
  initializeMembership(sequelize);

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

  // Membership associations
  User.hasMany(Membership, {
    as: 'memberships',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  Membership.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Project.hasMany(Membership, {
    as: 'memberships',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Membership.belongsTo(Project, {
    foreignKey: 'projectId',
    as: 'project',
  });

  User.hasMany(Membership, { as: 'createdMemberships', foreignKey: 'createdById' });
  Membership.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

  User.hasMany(Membership, { as: 'updatedMemberships', foreignKey: 'updatedById' });
  Membership.belongsTo(User, { as: 'updatedBy', foreignKey: 'updatedById' });
};

export const initializeModelsAndSync = async (sequelize: Sequelize) => {
  initializeModels(sequelize);
  await synchronizeTables(sequelize);
};

export { User } from './user';
export { Project } from './project';
