# 투두 · 투두 카테고리 API 명세

백엔드 구현 기준 (`TodoController`, `TodoCategoryController`).  
에러 시 본문은 대부분 `{ "message": "..." }` (`ErrorResponseDto`) 형태입니다.

---

## 내 투두 목록 조회

**GET** `/api/users/{userId}/todos`

### 인증

- 필요  
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `userId`: 조회 대상 회원 PK — **JWT에 담긴 회원 ID와 반드시 동일**해야 함

### Query Parameter

- 없음

### Request Body

- 없음 (GET)

### Response

- **200 OK** — `TodoResponseDTO` 배열

```json
[
  {
    "id": 1,
    "ownerId": 1,
    "ownerNickname": "그릿유저",
    "content": "과제 제출하기",
    "isDone": false,
    "categoryId": 2,
    "categoryName": "학교 과제",
    "dueDate": "2025-01-25",
    "createdAt": "2025-01-20T12:34:56",
    "updatedAt": "2025-01-20T12:34:56"
  }
]
```

- `categoryId` / `categoryName`: 카테고리 없으면 `null`

### Error

- **403 Forbidden**: Path의 `userId`가 로그인 사용자와 다름

---

## 그룹별 투두 목록 조회

**GET** `/api/groups/{groupCode}/todos`

그룹 멤버가 작성한 투두 **전체**를 돌려주며, 투두 행에는 그룹을 저장하지 않고 `MemberGroup`으로만 판별합니다. **`userId`에 해당하는 작성자의 투두가 목록 최상단**에 오도록 정렬합니다.

### 인증

- 필요
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `groupCode`: 조회할 그룹 초대 코드

### Request

- Query Parameter (Body 없음). 예시:

```text
userId=1
```

- URL 예: `/api/groups/ABCD12/todos?userId=1`
- `userId` (**필수**): 목록 맨 위에 둘 작성자의 회원 PK. **해당 그룹 멤버**여야 함. 그룹에 없는 값이면 **400**.

정렬: `userId` 작성자 투두 블록이 먼저, 그다음 다른 멤버. 각 블록 안에서는 미완료 우선 → `dueDate` 오름차순(null 뒤) → `id` 오름차순.

### Response

- **200 OK**

```json
[
  {
    "id": 1,
    "ownerId": 1,
    "ownerNickname": "그릿유저",
    "content": "과제 제출하기",
    "isDone": false,
    "categoryId": 2,
    "categoryName": "학교 과제",
    "dueDate": "2025-01-25",
    "createdAt": "2025-01-20T12:34:56",
    "updatedAt": "2025-01-20T12:34:56"
  }
]
```

- `categoryId` / `categoryName`: 없으면 `null`

### Error

- **400 Bad Request**: `userId`가 해당 그룹 멤버가 아님 (`해당 그룹에 속하지 않은 사용자입니다.`)
- **403 Forbidden**: 요청자(JWT)가 해당 그룹 멤버가 아님
- **404 Not Found**: 잘못된 `groupCode` 등

---

## 투두 생성

**POST** `/api/users/{userId}/todos`

### 인증

- 필요  
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `userId`: 작성자 회원 PK — **JWT 회원 ID와 동일**해야 함

### Query Parameter

- 없음

### Request Body

```json
{
  "content": "과제 제출하기",
  "dueDate": "2025-01-25",
  "categoryId": 1
}
```

- `content`: 필수, 공백만 불가, 최대 500자  
- `dueDate`: 필수, `yyyy-MM-dd`  
- `categoryId`: 선택, **본인이 등록한 카테고리**만

### Response

- **201 Created** — `TodoResponseDTO` 단일 객체

```json
{
  "id": 1,
  "ownerId": 1,
  "ownerNickname": "그릿유저",
  "content": "과제 제출하기",
  "isDone": false,
  "categoryId": 1,
  "categoryName": "학교 과제",
  "dueDate": "2025-01-25",
  "createdAt": "2025-01-20T12:34:56",
  "updatedAt": "2025-01-20T12:34:56"
}
```

### Error

- **400 Bad Request**: `@Valid` 검증 실패 (필드별 메시지 합쳐서 반환되는 경우 있음)  
- **403 Forbidden**: `userId`가 로그인 사용자와 다름  
- **404 Not Found**: 사용자 없음, 존재하지 않거나 타인의 `categoryId`

---

## 투두 수정

**PUT** `/api/todos/{todoId}`

### 인증

- 필요  
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `todoId`: 수정할 투두 ID

### Query Parameter

- `userId`: 요청자 회원 PK — **JWT 회원 ID와 동일**해야 함 (본인 투두만 수정)

### Request Body

모든 필드 **선택**. 보낸 필드만 반영.

```json
{
  "content": "수정된 과제 제출하기",
  "isDone": true,
  "dueDate": "2025-01-26",
  "removeCategory": false,
  "categoryId": 3
}
```

- `content`: 보낼 경우 trim 후 비어 있으면 **400**  
- `removeCategory`: `true`이면 카테고리 해제 (`categoryId`보다 우선)  
- `categoryId`: 본인 카테고리만

### Response

- **200 OK** — `TodoResponseDTO` 단일 객체

### Error

- **400 Bad Request**: 예) `content`를 보냈는데 공백만 있는 경우  
- **403 Forbidden**: `userId` 불일치 또는 타인의 투두  
- **404 Not Found**: 투두 없음, 잘못된 `categoryId` 등

---

## 투두 삭제

**DELETE** `/api/todos/{todoId}`

### 인증

- 필요  
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `todoId`: 삭제할 투두 ID

### Query Parameter

- `userId`: 요청자 회원 PK — **JWT 회원 ID와 동일**해야 함

### Request Body

- 없음

### Response

- **204 No Content** (본문 없음)

### Error

- **403 Forbidden**: `userId` 불일치 또는 타인의 투두  
- **404 Not Found**: 투두 없음

---

## 지난 7일 일별 달성도 조회

**GET** `/api/users/{userId}/todos/achievement/last-7-days`

### 인증

- 필요  
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `userId`: 회원 PK — **JWT 회원 ID와 동일**해야 함

### Query Parameter

- 없음

### Request Body

- 없음 (GET)

### 동작 요약

- **오늘은 제외**, 어제 기준으로 역방향 7일 구간의 일별 집계  
- 해당 날짜에 마감일(`dueDate`)이 있는 투두가 없으면 `totalCount` / `doneCount` / `achievementRate`가 `null`인 항목이 올 수 있음

### Response

- **200 OK**

```json
[
  {
    "date": "2025-01-18",
    "totalCount": 3,
    "doneCount": 2,
    "achievementRate": 67
  },
  {
    "date": "2025-01-19",
    "totalCount": null,
    "doneCount": null,
    "achievementRate": null
  }
]
```

### Error

- **403 Forbidden**: `userId`가 로그인 사용자와 다름

---

## 투두 카테고리 목록 조회

**GET** `/api/users/{userId}/todo-categories`

### 인증

- 필요  
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `userId`: 회원 PK — **JWT 회원 ID와 동일**해야 함

### Query Parameter

- 없음

### Request Body

- 없음 (GET)

### Response

- **200 OK**

```json
[
  { "id": 1, "name": "학교 과제" },
  { "id": 2, "name": "자격증" }
]
```

### Error

- **403 Forbidden**: `userId` 불일치  
- **404 Not Found**: 존재하지 않는 사용자

---

## 투두 카테고리 등록

**POST** `/api/users/{userId}/todo-categories`

### 인증

- 필요  
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `userId`: 회원 PK — **JWT 회원 ID와 동일**해야 함

### Query Parameter

- 없음

### Request Body

```json
{
  "name": "학교 과제"
}
```

- `name`: 필수, 최대 50자, **같은 `userId` 내 이름 중복 불가** (수정 API 없음)

### Response

- **201 Created**

```json
{
  "id": 1,
  "name": "학교 과제"
}
```

### Error

- **400 Bad Request**: 검증 실패  
- **403 Forbidden**: `userId` 불일치  
- **404 Not Found**: 사용자 없음  
- **409 Conflict**: 동일 이름 카테고리 이미 존재

---

## 투두 카테고리 삭제

**DELETE** `/api/users/{userId}/todo-categories/{categoryId}`

### 인증

- 필요  
- Header: `Authorization: Bearer {access_token}`

### Path Variable

- `userId`: 회원 PK — **JWT 회원 ID와 동일**해야 함  
- `categoryId`: 삭제할 카테고리 ID

### Query Parameter

- 없음

### Request Body

- 없음

### 동작 요약

- 삭제 후 해당 카테고리를 쓰던 투두는 **카테고리만 해제** (투두 행은 유지)

### Response

- **204 No Content** (본문 없음)

### Error

- **403 Forbidden**: `userId` 불일치  
- **404 Not Found**: 해당 사용자 소유가 아닌 카테고리 또는 없음
