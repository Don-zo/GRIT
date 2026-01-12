export interface Group {
    id: number;
    groupName: string;
    image?: string;
    isLive: boolean;
    totalMembers: number;
    liveMembers: number;
}