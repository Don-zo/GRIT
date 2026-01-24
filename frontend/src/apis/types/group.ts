// 그룹 생성 요청
export interface CreateGroupRequest {
  name: string;
  imageUrl: string;
}

// 그룹 생성 응답
export interface CreateGroupResponse {
  id: number;
  name: string;
  memberCount: number;
  imageUrl: string;
}

//그룹 정보 수정 요청
export interface UpdateGroupRequest {
  name: string;
  imageUrl: string;
}

//그룹 정보 수정 응답
export interface UpdateGroupResponse {
  id: number;
  name: string;
  memberCount: number;
  imageUrl: string;
}
