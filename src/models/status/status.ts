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
import Project from 'src/models/project/project';

class Status extends Model<InferAttributes<Status>, InferCreationAttributes<Status>> {
  declare id: CreationOptional<string>;
  declare name: string;

  // Project associations - BelongsTo
  declare getProject: BelongsToGetAssociationMixin<Project>;
  declare projectId: ForeignKey<Project['id']>;
  declare project: NonAttribute<Project>;
}

export const initializeStatus = (sequelize: Sequelize) => {
  Status.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      projectId: {
        type: DataTypes.UUID,
      },
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: 'statuses',
      timestamps: false,
    },
  );
};

export default Status;
