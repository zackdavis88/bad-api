import { Sequelize } from 'sequelize';
import { User, initializeUser } from './user';
import { Project, initializeProject } from './project';
import { Membership, initializeMembership } from './membership';
import { Status, initializeStatus } from './status';

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
  initializeStatus(sequelize);

  /*  Sequelize is weird. These associations need to be done outside of the model files
   *  and after model initialization because of our code structure.
   */

  // Project -> User associations: createdBy
  User.hasMany(Project, { as: 'createdProjects', foreignKey: 'createdById' });
  User.hasOne(Project, { as: 'createdProject', foreignKey: 'createdById' });
  Project.belongsTo(User, { as: 'createdBy' });

  // Project -> User associations: updatedBy
  User.hasMany(Project, { as: 'updatedProjects', foreignKey: 'updatedById' });
  User.hasOne(Project, { as: 'updatedProject', foreignKey: 'updatedById' });
  Project.belongsTo(User, { as: 'updatedBy' });

  // Project -> User associations: deletedBy
  User.hasMany(Project, { as: 'deletedProjects', foreignKey: 'deletedById' });
  User.hasOne(Project, { as: 'deletedProject', foreignKey: 'deletedById' });
  Project.belongsTo(User, { as: 'deletedBy' });

  // Membership -> User associations: createdBy
  User.hasMany(Membership, { as: 'createdMemberships', foreignKey: 'createdById' });
  User.hasOne(Membership, { as: 'createdMembership', foreignKey: 'createdById' });
  Membership.belongsTo(User, { as: 'createdBy' });

  // Membership -> User associations: updatedBy
  User.hasMany(Membership, { as: 'updatedMemberships', foreignKey: 'updatedById' });
  User.hasOne(Membership, { as: 'updatedMembership', foreignKey: 'updatedById' });
  Membership.belongsTo(User, { as: 'updatedBy' });

  // Membership -> User associations: memberships
  User.hasMany(Membership, {
    as: 'memberships',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  User.hasOne(Membership, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  Membership.belongsTo(User, {
    as: 'user',
  });

  // Membership -> Project associations: memberships
  Project.hasMany(Membership, {
    as: 'memberships',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Project.hasOne(Membership, {
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Project.hasOne(Membership, {
    as: 'authUserMembership',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Membership.belongsTo(Project, {
    as: 'project',
  });

  // Status -> Project associations: statuses
  Project.hasMany(Status, {
    as: 'statuses',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Status.belongsTo(Project, {
    as: 'project',
  });
};

export const initializeModelsAndSync = async (sequelize: Sequelize) => {
  initializeModels(sequelize);
  await synchronizeTables(sequelize);
};

export { User } from './user';
export { Project } from './project';
export { Membership } from './membership';
