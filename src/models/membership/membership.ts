import {
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey,
  BelongsToGetAssociationMixin,
  NonAttribute,
} from 'sequelize';
import User from 'src/models/user/user';
import Project from 'src/models/project/project';

class Membership extends Model<
  InferAttributes<Membership>,
  InferCreationAttributes<Membership>
> {
  declare id: CreationOptional<string>;
  // Can add members, can add stories/epics/bugs, can delete project
  declare isProjectAdmin: CreationOptional<boolean>;
  // Can add members, can add stories/epics/bugs
  declare isProjectManager: CreationOptional<boolean>;

  declare createdById: ForeignKey<User['id']>;
  declare createdBy: NonAttribute<User>;
  declare createdOn: CreationOptional<Date>;

  declare updatedById: ForeignKey<User['id']> | null;
  declare updatedBy: NonAttribute<User> | null;
  declare updatedOn: CreationOptional<Date> | null;

  declare userId: ForeignKey<User['id']>;
  declare user: NonAttribute<User>;
  declare getUser: BelongsToGetAssociationMixin<User>;

  declare projectId: ForeignKey<Project['id']>;
  declare project: NonAttribute<Project>;
  declare getProject: BelongsToGetAssociationMixin<Project>;
}

export const initializeMembership = (sequelize: Sequelize) => {
  Membership.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      projectId: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      createdOn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedOn: {
        type: DataTypes.DATE,
      },
      isProjectAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isProjectManager: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'memberships',
      timestamps: false,
    },
  );
};

export default Membership;
