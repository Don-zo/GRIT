export interface Group {
  groupCode: string;
  name: string;
  memberCount: number;
  imageUrl: string;
}

export interface GroupInput {
  name: string;
  imageName?: string;
}

export type CreateGroupRequest = GroupInput;
export type UpdateGroupRequest = Partial<GroupInput>;
