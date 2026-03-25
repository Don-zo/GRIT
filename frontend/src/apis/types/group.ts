export interface Group {
  groupCode: string;
  name: string;
  memberCount: number;
  imageUrl: string; //get 응답에서 받는 랜더링을 위한 URL
}

export interface GroupInput {
  name: string;
  imageName?: string; //create 또는 update 시에 서버로 보내는 값
}

export interface S3uploadResponse {
  fileName: string; //백엔드가 준 키 = UUID
  uploadUrl: string; //S3에 put할 주소 = Presigned URL
}

export type CreateGroupRequest = GroupInput;
export type UpdateGroupRequest = Partial<GroupInput>;
