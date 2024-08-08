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
  createdBy: Pick<UserData, 'username' | 'displayName'> | null;
  updatedBy?: Pick<UserData, 'username' | 'displayName'> | null;
  deletedBy?: Pick<UserData, 'username' | 'displayName'> | null;
}

export enum AuthorizationAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface MembershipData {
  id: string;
  user: Pick<UserData, 'username' | 'displayName'>;
  project: Pick<ProjectData, 'id' | 'name'>;
  isProjectAdmin: boolean;
  isProjectManager: boolean;
  createdOn: Date;
  updatedOn?: Date | null;
  deletedOn?: Date;
  createdBy: Pick<UserData, 'username' | 'displayName'> | null;
  updatedBy?: Pick<UserData, 'username' | 'displayName'> | null;
  deletedBy?: Pick<UserData, 'username' | 'displayName'>;
}

export interface StatusData {
  id: string;
  name: string;
  project: Pick<ProjectData, 'id' | 'name'>;
}

export interface StoryDetails {
  id: string;
  project: Pick<ProjectData, 'id' | 'name'>;
  title: string;
  details: string;
  status: Omit<StatusData, 'project'>;
  createdOn: Date;
  updatedOn?: Date | null;
  createdBy: Pick<UserData, 'username' | 'displayName'> | null;
  updatedBy?: Pick<UserData, 'username' | 'displayName'> | null;
}
