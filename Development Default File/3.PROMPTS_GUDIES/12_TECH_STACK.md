# 12. 기술 스택 및 코딩 스타일
> 개발 환경 설정과 코딩 규칙을 정의하기 위한 프롬프트

---

## 🛠️ 기술 스택 정의

```
"우리 프로젝트의 기술 스택을 정의해줘.

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

## 📁 프로젝트 구조 설정

```
"우리 프로젝트의 폴더 구조를 설정해줘:

src/
├── components/   # 재사용 컴포넌트
├── pages/        # 페이지 컴포넌트
├── hooks/        # 커스텀 훅
├── services/     # API 호출
├── utils/        # 유틸리티 함수
├── styles/       # 스타일 파일
├── types/        # 타입 정의
└── constants/    # 상수

각 폴더의 역할과 파일 네이밍 규칙을 알려줘."
```

---

## 📝 코딩 스타일 가이드

```
"우리 프로젝트의 코딩 스타일 가이드를 만들어줘:

1. 네이밍 컨벤션
   - 변수/함수: camelCase
   - 컴포넌트: PascalCase
   - 상수: UPPER_SNAKE_CASE
   - 파일명: kebab-case 또는 PascalCase

2. 코드 포맷팅
   - 들여쓰기: 2 spaces
   - 줄 길이: 80-100자
   - 세미콜론: 사용/미사용

3. 주석 규칙
   - 한국어로 작성
   - 함수/컴포넌트 상단에 설명 추가

4. 임포트 순서
   - 외부 라이브러리
   - 내부 모듈
   - 스타일/타입"
```

---

## ⚙️ 환경 변수 설정

```
"프로젝트의 환경 변수를 설정해줘:

.env.local 파일:
- API 키
- Firebase 설정
- 데이터베이스 URL
- 기타 민감한 정보

환경별 구분 (dev, staging, prod)도 포함해줘."
```

---

## 🔧 ESLint / Prettier 설정

```
"ESLint와 Prettier 설정 파일을 만들어줘:

.eslintrc.js:
- 규칙 설정
- 플러그인 추가

.prettierrc:
- 포맷팅 규칙

프로젝트 특성에 맞게 커스터마이징해줘."
```

---

## 🧪 테스트 설정

```
"테스트 환경을 설정해줘:

1. 유닛 테스트: Jest / Vitest
2. 컴포넌트 테스트: React Testing Library
3. E2E 테스트: Playwright / Cypress

테스트 파일 위치와 네이밍 규칙도 알려줘."
```

---

## 📦 패키지 매니저 및 스크립트

```
"package.json의 scripts를 설정해줘:

{
  'scripts': {
    'dev': '개발 서버 실행',
    'build': '프로덕션 빌드',
    'start': '프로덕션 서버',
    'lint': 'ESLint 검사',
    'format': 'Prettier 포맷팅',
    'test': '테스트 실행'
  }
}

각 스크립트의 용도를 설명해줘."
```

---

## 💡 기술 스택 심화 질문

```
"이 기술 스택에서 성능 최적화 방법은?"
"확장성을 고려했을 때 변경해야 할 부분은?"
"보안 관점에서 주의할 점은?"
```

---

[← 이전: 디자인 시스템](./11_DESIGN_SYSTEM.md) | [목차](./00_INDEX.md) | [다음: 기능 구현 →](./13_FEATURE_IMPLEMENTATION.md)
