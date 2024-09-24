import { Sequelize } from 'sequelize';
import { User, initializeUser } from './user';
import { Project, initializeProject } from './project';
import { Membership, initializeMembership } from './membership';
import { Status, initializeStatus } from './status';
import { Story, initializeStory } from './story';

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
  initializeStory(sequelize);

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
  Project.hasOne(Status, {
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Status.belongsTo(Project, {
    as: 'project',
  });

  // Story -> Status associations: status
  Status.hasMany(Story, {
    foreignKey: 'statusId',
  });
  Status.hasOne(Story, {
    foreignKey: 'statusId',
  });
  Story.belongsTo(Status, {
    as: 'status',
  });

  // Story -> User associations: createdBy
  User.hasMany(Story, { as: 'createdStories', foreignKey: 'createdById' });
  User.hasOne(Story, { as: 'createdStory', foreignKey: 'createdById' });
  Story.belongsTo(User, { as: 'createdBy' });

  // Story -> User associations: updatedBy
  User.hasMany(Story, { as: 'updatedStories', foreignKey: 'updatedById' });
  User.hasOne(Story, { as: 'updatedStory', foreignKey: 'updatedById' });
  Story.belongsTo(User, { as: 'updatedBy' });

  // Story -> User associations: ownedBy
  User.hasMany(Story, { as: 'ownedStories', foreignKey: 'ownedById' });
  User.hasOne(Story, { as: 'ownedStory', foreignKey: 'ownedById' });
  Story.belongsTo(User, { as: 'ownedBy' });

  // Story -> Project associations: stories
  Project.hasMany(Story, {
    as: 'stories',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Project.hasOne(Story, {
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Story.belongsTo(Project, {
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
export { Status } from './status';
export { Story } from './story';
