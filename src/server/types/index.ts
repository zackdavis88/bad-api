export interface UserData {
  username: string;
  displayName: string;
  createdOn: Date;
  updatedOn?: Date | null;
  deletedOn?: Date | null;
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  createdOn: Date;
  updatedOn?: Date | null;
  deletedOn?: Date;
  createdBy?: Omit<UserData, 'createdOn' | 'updatedOn'>;
  updatedBy?: Omit<UserData, 'createdOn' | 'updatedOn'>;
  deletedBy?: Omit<UserData, 'createdOn' | 'updatedOn'>;
}
