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
  deletedOn?: Date | null;
  createdBy: Omit<UserData, 'createdOn' | 'updatedOn'> | null;
  updatedBy?: Omit<UserData, 'createdOn' | 'updatedOn'> | null;
  deletedBy?: Omit<UserData, 'createdOn' | 'updatedOn'> | null;
}
