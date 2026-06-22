export interface Group {
  groupCode: string;
  name: string;
  memberCount: number;
  imageUrl?: string;
  isLive: boolean;
  liveParticipantCount: number;
}
