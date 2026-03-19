export interface GroupCoreInfo {
  id: number;
  name: string;
  memberCount: number;
  imageUrl: string;
}

export interface Group extends GroupCoreInfo {
  inviteCode: string;
}

export interface GroupInput {
  name: string;
  imageUrl: string;
}

export interface GroupList {
  groups: Group[];
}

export type CreateGroupRequest = GroupInput;
export type UpdateGroupRequest = Partial<GroupInput>;
