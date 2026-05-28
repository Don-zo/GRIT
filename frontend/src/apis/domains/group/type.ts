export interface Group {
  groupCode: string;
  name: string;
  memberCount: number;
  imageUrl: string;
  isLive: boolean;
  liveParticipantCount: number;
}

export interface GroupInput {
  name: string;
  imageName?: string | null;
}

export type CreateGroupRequest = GroupInput;
export type UpdateGroupRequest = Partial<GroupInput>;
