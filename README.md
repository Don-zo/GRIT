<div align="center">
  
# <img width="250" alt="image" src="https://github.com/user-attachments/assets/2745b186-0083-493e-8479-7bc580b26436" />



  
**공간을 넘어 이어지는 우리만의 독서실**

그룹 기반 캠스터디, 뽀모도로, 투두 관리를 하나의 스터디룸에서 제공하는 온라인 집중 공간

![Java](https://img.shields.io/badge/Java-25-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)

</div>

## 프로젝트 소개

GRIT은 온라인에서도 같은 독서실에 있는 것처럼 함께 공부할 수 있게 만드는 캠스터디 서비스입니다. 사용자는 구글 계정으로 로그인하고, 그룹을 생성하거나 초대 코드로 참여한 뒤, 그룹 스터디룸에서 캠을 켜고 함께 공부할 수 있습니다.

스터디룸 안에서는 LiveKit 기반 화상 연결, 이모지 반응, 뽀모도로 타이머, 그룹원 투두 현황 확인이 한 화면에서 이어집니다. 혼자 쓰는 투두 앱이나 단순 화상 회의가 아니라, **집중 시간과 진행 상황을 함께 공유하는 스터디 흐름**을 만드는 것이 목표입니다.

## 주요 기능

- **그룹 스터디**: 그룹 생성, 초대 코드 참여, 그룹원 조회, 그룹 이미지 관리
- **캠스터디룸**: LiveKit 토큰 발급 후 그룹 단위 실시간 화상 연결
- **뽀모도로 타이머**: 그룹 스터디룸에서 집중/휴식 라운드를 함께 진행
- **투두 관리**: 개인 투두, 카테고리, 완료 여부, 날짜 이동, 달성도 조회
- **그룹원 투두 현황**: 같은 그룹 멤버의 오늘/내일/2일 후 투두와 완료 개수 확인
- **이모지 반응**: 스터디룸에서 LiveKit data packet 기반 이모지 반응 전송
- **프로필과 친구**: 구글 OAuth 로그인, 최초 프로필 설정, 친구 추가/삭제/조회

## 화면 구성

| 화면 | 설명 |
| --- | --- |
| Landing | 서비스 소개와 시작 진입점 |
| Home | 프로필, 오늘의 달성도, 내 그룹 목록, 친구 관리 |
| Room | 캠스터디, 뽀모도로, 이모지 반응, 그룹원 투두 패널 |
| Todo | 개인 투두와 카테고리 관리 |
| OAuth Redirect | 구글 로그인 후 토큰 처리 및 최초 가입자 분기 |

## 기술 스택

- **Backend:** Spring Boot 4 · Java 25 · Spring Security · OAuth2 Client · JWT · Spring Data JPA · PostgreSQL · Redis · LiveKit Server SDK · AWS S3 · SpringDoc · Gradle
- **Frontend:** React 19 · TypeScript · Vite · React Router · TanStack Query · Axios · Tailwind CSS · LiveKit Client · Framer Motion
- **Infra/Observability:** GitHub Actions · S3 · CloudFront · Self-hosted Runner · Actuator · Prometheus · OpenTelemetry · Loki

## 디렉터리 구조

```text
GRIT
├── backend/grit
│   └── src/main/java/grit
│       ├── domain
│       │   ├── auth              # Google OAuth, JWT, refresh token
│       │   ├── friend            # 친구 추가, 삭제, 조회
│       │   ├── group             # 그룹, LiveKit, Pomodoro
│       │   ├── member            # 회원, 프로필, 이미지 업로드 URL
│       │   └── todo              # 투두, 카테고리, 달성도
│       └── global
│           ├── config            # Security, JPA, Time 설정
│           ├── exception         # 공통 예외 처리
│           ├── s3                # S3 presigned URL
│           └── security          # 인증 사용자 검증
│
├── frontend
│   └── src
│       ├── apis                  # API client, endpoint, domain API
│       ├── components            # 공통 UI 컴포넌트
│       ├── hooks                 # LiveKit, Todo, Toast hooks
│       ├── pages                 # Landing, Home, Room, Todo, Signup
│       ├── routes                # React Router 설정
│       └── types                 # 프론트 타입 정의
│
└── .github/workflows             # FE/BE build & deploy
```

## 로컬 실행

필요한 환경:

- Java 25
- Node.js 20+
- PostgreSQL
- Redis
- LiveKit
- AWS S3 bucket
- Google OAuth client

```bash
# Backend
cd backend/grit
./gradlew bootRun

# Frontend
cd frontend
npm install
npm run dev
```

테스트와 빌드:

```bash
# Backend test/build
cd backend/grit
./gradlew test
./gradlew clean build

# Frontend lint/build
cd frontend
npm run lint
npm run build
```

## 환경 변수

백엔드는 `application.properties` 기준으로 아래 환경 변수를 사용합니다.

```text
DB_HOST
DB_NAME
DB_USER
DB_PASSWORD
REDIS_HOST
REDIS_PORT
LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
AWS_S3_ACCESS_KEY
AWS_S3_SECRET_KEY
AWS_S3_BUCKET_NAME
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
JWT_SECRET
JWT_ACCESS_EXPIRATION
JWT_REFRESH_EXPIRATION
OTEL_ENDPOINT
```

민감한 값은 `.env` 또는 배포 환경의 secret으로 관리하고 저장소에 커밋하지 않습니다.

## API 문서

백엔드 실행 후 SpringDoc OpenAPI UI에서 API를 확인할 수 있습니다.

```text
http://localhost:8080/swagger-ui/index.html
```

주요 API 그룹:

- `Auth`: 구글 로그인, 토큰 재발급, 로그아웃
- `Member`: 내 정보, 프로필 초기화/수정, 닉네임 중복 확인, 이미지 업로드 URL
- `Group`: 그룹 생성/참여/조회/수정/삭제, 그룹원 조회, 그룹원 투두 조회
- `Friend`: 친구 추가, 삭제, 목록 조회
- `Todo`: 투두 CRUD, 카테고리, 완료 처리, 달성도
- `LiveKit`: 룸 토큰, 이모지 반응, webhook
- `Pomodoro`: 타이머 조회, 시작, 일시정지, 재개, 중지

## 배포

- **Backend:** `main`, `dev/backend` push 시 Gradle build 후 self-hosted runner에서 JAR 배포
- **Frontend:** `main`, `dev/front` push 시 Vite build 후 S3 sync 및 CloudFront invalidation

## 팀

- 프론트엔드: React 기반 화면, 스터디룸 UI, 투두/그룹/프로필 플로우
- 백엔드: 인증, 그룹, 투두, LiveKit, Pomodoro, S3, 배포 파이프라인
