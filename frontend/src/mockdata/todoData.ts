import type { TodoGroup } from "@/types/todo";

/* =========================================================
   🔥 1) CATEGORY DATA — 이름별
========================================================= */
export const categoryDataByUser: Record<string, TodoGroup[]> = {
  이유민: [
    {
      id: "ym-cat-1",
      title: "학교 과제",
      items: [
        { id: 1, label: "공업수학 과제 6번 풀이", done: false },
        { id: 2, label: "운영체제 10장 정리", done: false },
        { id: 3, label: "데베 ERD 수정", done: true },
        { id: 4, label: "프밍언 파트5 필기", done: false },
      ],
    },
    {
      id: "ym-cat-2",
      title: "동아리 / 프로젝트",
      items: [
        { id: 5, label: "GRIT UI 컴포넌트 점검", done: true },
        { id: 6, label: "앱티브 아이디어톤 자료 정리", done: false },
        { id: 7, label: "WhoAreYou OCR 개선안 작성", done: false },
      ],
    },
    {
      id: "ym-cat-3",
      title: "개인 일정",
      items: [
        { id: 8, label: "스터디 플래너 정리", done: true },
        { id: 9, label: "독서 30분", done: false },
      ],
    },
  ],

  김윤영: [
    {
      id: "ky-cat-1",
      title: "전공 과목",
      items: [
        { id: 10, label: "DB 쿼리 실습 과제", done: false },
        { id: 11, label: "운영체제 퀴즈 대비", done: true },
        { id: 12, label: "자료구조 풀이 제출", done: false },
      ],
    },
    {
      id: "ky-cat-2",
      title: "자격증 공부",
      items: [
        { id: 13, label: "정보처리기사 1단원 정리", done: false },
        { id: 14, label: "과년도 문제 10개 풀기", done: false },
      ],
    },
  ],

  양준영: [
    {
      id: "yj-cat-1",
      title: "캡스톤 프로젝트",
      items: [
        { id: 20, label: "문헌 조사 정리", done: false },
        { id: 21, label: "회의록 작성", done: true },
      ],
    },
    {
      id: "yj-cat-2",
      title: "학교 과제",
      items: [
        { id: 22, label: "네트워크 실습 제출", done: false },
        { id: 23, label: "OS 문제 풀이", done: false },
        { id: 24, label: "DB ER 모델링 재작성", done: false },
      ],
    },
  ],

  이차현: [
    {
      id: "ic-cat-1",
      title: "학교 일정",
      items: [
        { id: 30, label: "프밍언 실습 준비", done: false },
        { id: 31, label: "수학 연습문제", done: true },
      ],
    },
    {
      id: "ic-cat-2",
      title: "프로젝트 일정",
      items: [
        { id: 32, label: "AI 모델 조사", done: false },
        { id: 33, label: "Figma UI 구조 설계", done: false },
        { id: 34, label: "발표자료 수정", done: true },
      ],
    },
  ],
};

/* =========================================================
   🔥 2) DAY DATA — 이름별
========================================================= */
export const dayDataByUser: Record<string, TodoGroup[]> = {
  이유민: [
    {
      id: "ym-day-1",
      title: "오늘",
      items: [
        { id: 101, label: "운영체제 복습", done: false },
        { id: 102, label: "웹앱스 회의록 정리", done: true },
        { id: 103, label: "공업수학 문제 2개 풀기", done: false },
      ],
    },
    {
      id: "ym-day-2",
      title: "내일",
      items: [
        { id: 104, label: "프밍언 파트6 읽기", done: false },
        { id: 105, label: "데베 과제 점검", done: false },
      ],
    },
    {
      id: "ym-day-3",
      title: "2일 후",
      items: [{ id: 106, label: "프로젝트 피드백 정리", done: false }],
    },
  ],

  김윤영: [
    {
      id: "ky-day-1",
      title: "오늘",
      items: [
        { id: 110, label: "공강 이용해서 DB 공부", done: false },
        { id: 111, label: "스터디 문제 풀이", done: true },
      ],
    },
    {
      id: "ky-day-2",
      title: "내일",
      items: [{ id: 112, label: "운영체제 요약 정리", done: false }],
    },
  ],

  양준영: [
    {
      id: "yj-day-1",
      title: "오늘",
      items: [
        { id: 120, label: "캡스톤 보고서 작성", done: false },
        { id: 121, label: "네트워크 퀴즈 준비", done: false },
      ],
    },
    {
      id: "yj-day-2",
      title: "내일",
      items: [{ id: 122, label: "React 공부 1시간", done: false }],
    },
  ],

  이차현: [
    {
      id: "ic-day-1",
      title: "오늘",
      items: [
        { id: 130, label: "프밍언 문제 복습", done: true },
        { id: 131, label: "과제 일정 정리", done: false },
      ],
    },
    {
      id: "ic-day-2",
      title: "2일 후",
      items: [
        { id: 132, label: "AI 모델 비교하기", done: false },
        { id: 133, label: "발표자료 준비", done: false },
      ],
    },
  ],
};
