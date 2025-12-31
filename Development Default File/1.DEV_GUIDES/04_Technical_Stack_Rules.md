# 🛠️ Technical Stack & Rules (기술 스택 및 규칙)
> 프로젝트의 기술 선택과 개발 규칙 정의

---

## 🎯 기술 스택 정의 요청

```
"우리 프로젝트의 기술 스택을 정의해줘:

포함할 내용:
- 프론트엔드: [React, Next.js, Flutter 등]
- 백엔드: [Firebase, Supabase, Node.js 등]
- 데이터베이스: [Firestore, PostgreSQL 등]
- 상태 관리: [Redux, Zustand, Provider 등]
- 스타일링: [Tailwind CSS, styled-components 등]
- 인증: [Firebase Auth, OAuth 등]
- 배포: [Vercel, Firebase Hosting 등]

각 선택의 이유와 대안도 설명해줘."
```

---

## 📁 프로젝트 구조

```
"프로젝트 폴더 구조를 설정해줘:

src/
├── app/           # 페이지 (App Router)
├── components/
│   ├── ui/        # 기본 UI 컴포넌트
│   ├── layout/    # 레이아웃 컴포넌트
│   └── features/  # 기능별 컴포넌트
├── hooks/         # 커스텀 훅
├── services/      # API 호출
├── lib/           # 유틸리티
├── types/         # 타입 정의
├── styles/        # 글로벌 스타일
└── constants/     # 상수

각 폴더의 역할을 설명해줘."
```

---

## 📏 개발 규칙 정의

```
"프로젝트 개발 규칙을 정리해줘:

1. 파일/폴더 네이밍
   - 컴포넌트: PascalCase (Button.tsx)
   - 유틸리티: camelCase (formatDate.ts)
   - 상수: UPPER_SNAKE_CASE

2. 컴포넌트 규칙
   - 한 파일당 하나의 컴포넌트
   - Props 타입은 컴포넌트 위에 정의
   - 150줄 초과 시 분리 검토

3. 임포트 순서
   - 외부 라이브러리
   - 내부 모듈
   - 스타일/타입"
```

---

## 🔧 필수 라이브러리

```
"프로젝트에 필요한 라이브러리 목록을 정리해줘:

Core:
- next
- react
- typescript

UI/Styling:
- tailwindcss
- lucide-react (아이콘)

State/Data:
- firebase
- @tanstack/react-query

Utilities:
- date-fns
- zod (유효성 검사)

Dev:
- eslint
- prettier"
```

---

## 📋 package.json 스크립트

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

---

[목차로 돌아가기](./00_INDEX.md)
