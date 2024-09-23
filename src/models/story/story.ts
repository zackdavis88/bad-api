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
import Status from 'src/models/status/status';

class Story extends Model<InferAttributes<Story>, InferCreationAttributes<Story>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare details: CreationOptional<string | null>;

  // User associations - BelongsTo
  declare getCreatedBy: BelongsToGetAssociationMixin<User>;
  declare createdById: ForeignKey<User['id'] | null>;
  declare createdBy: NonAttribute<User | null>;
  declare createdOn: CreationOptional<Date>;

  declare getUpdatedBy: BelongsToGetAssociationMixin<User>;
  declare updatedById: ForeignKey<User['id'] | null>;
  declare updatedBy: NonAttribute<User | null>;
  declare updatedOn: CreationOptional<Date | null>;

  declare getOwnedBy: BelongsToGetAssociationMixin<User>;
  declare ownedById: ForeignKey<User['id'] | null>;
  declare ownedBy: NonAttribute<User | null>;

  // Project associations - BelongsTo
  declare getProject: BelongsToGetAssociationMixin<Project>;
  declare projectId: ForeignKey<Project['id']>;
  declare project: NonAttribute<Project>;

  // Status associations - BelongsTo
  declare getStatus: BelongsToGetAssociationMixin<Status>;
  declare statusId: ForeignKey<Status['id']>;
  declare status: NonAttribute<Status>;
}

export const initializeStory = (sequelize: Sequelize) => {
  Story.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
      },
      details: {
        type: DataTypes.TEXT,
      },
      createdOn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedOn: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      tableName: 'stories',
      timestamps: false,
    },
  );
};

export default Story;
