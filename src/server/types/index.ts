export interface UserData {
  username: string;
  displayName: string;
  createdOn: Date;
  updatedOn?: Date | null;
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  createdOn: Date;
  updatedOn?: Date | null;
  createdBy?: Omit<UserData, 'createdOn' | 'updatedOn'>;
  updatedBy?: Omit<UserData, 'createdOn' | 'updatedOn'>;
}
