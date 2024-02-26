import {
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey,
  NonAttribute,
  BelongsToGetAssociationMixin,
} from 'sequelize';
import User from 'src/models/user/user';
import Project from 'src/models/project/project';

class Membership extends Model<
  InferAttributes<Membership>,
  InferCreationAttributes<Membership>
> {
  declare id: CreationOptional<string>;
  declare isProjectAdmin: CreationOptional<boolean>;
  declare isProjectManager: CreationOptional<boolean>;

  // User associations - BelongsTo
  declare getCreatedBy: BelongsToGetAssociationMixin<User | null>;
  declare createdById: ForeignKey<User['id']>;
  declare createdBy: NonAttribute<User | null>;
  declare createdOn: CreationOptional<Date>;

  declare getUpdatedBy: BelongsToGetAssociationMixin<User | null>;
  declare updatedById: ForeignKey<User['id'] | null>;
  declare updatedBy: NonAttribute<User | null>;
  declare updatedOn: CreationOptional<Date | null>;

  declare getUser: BelongsToGetAssociationMixin<User>;
  declare userId: ForeignKey<User['id']>;
  declare user: NonAttribute<User>;

  // Project associations - BelongsTo
  declare getProject: BelongsToGetAssociationMixin<Project>;
  declare projectId: ForeignKey<Project['id']>;
  declare project: NonAttribute<Project>;
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
