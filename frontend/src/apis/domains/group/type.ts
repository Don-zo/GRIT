export interface Group {
  groupCode: string;
  name: string;
  memberCount: number;
  imageUrl: string;
  isLive: boolean;
  liveParticipantCount: number;
}

export interface GroupMember {
  id: number;
  nickname: string;
  me: boolean;
}

export type GroupMemberTodoView = "category" | "day";

export interface GroupMemberTodo {
  id: number;
  ownerId: number;
  ownerNickname: string;
  content: string;
  isDone: boolean;
  categoryId: number | null;
  categoryName: string | null;
  categorySortOrder?: number | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMemberTodoSection {
  key: string;
  label: string;
  todos: GroupMemberTodo[];
}

export interface GroupMemberTodosResponse {
  view: GroupMemberTodoView;
  startDate: string;
  endDate: string;
  sections: GroupMemberTodoSection[];
}

export interface GroupInput {
  name: string;
  imageName?: string | null;
}

export type CreateGroupRequest = GroupInput;
export type UpdateGroupRequest = Partial<GroupInput>;
