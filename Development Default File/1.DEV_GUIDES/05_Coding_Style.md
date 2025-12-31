# 📝 Coding Style & Conventions (코딩 스타일)
> 일관된 코드 작성을 위한 스타일 가이드

---

## 🎯 코딩 스타일 가이드 요청

```
"우리 프로젝트의 코딩 스타일 가이드를 만들어줘:

1. 네이밍 컨벤션
   - 변수/함수: camelCase
   - 컴포넌트: PascalCase
   - 상수: UPPER_SNAKE_CASE
   - 타입/인터페이스: PascalCase

2. 코드 포맷팅
   - 들여쓰기: 2 spaces
   - 줄 길이: 80-100자
   - 세미콜론: 사용

3. 주석 규칙
   - 한국어로 작성
   - 함수/컴포넌트 상단에 설명
   - TODO/FIXME 태그 사용"
```

---

## 📋 네이밍 컨벤션

```
"세부 네이밍 규칙을 정의해줘:

| 항목 | 규칙 | 예시 |
|------|------|------|
| 변수 | camelCase | userName |
| 상수 | UPPER_SNAKE | MAX_COUNT |
| 함수 | camelCase | getUserData |
| 컴포넌트 | PascalCase | UserProfile |
| 훅 | use 접두사 | useAuth |
| 이벤트 핸들러 | handle 접두사 | handleClick |
| boolean | is/has 접두사 | isLoading |
| 배열 | 복수형 | users |
| 타입 | PascalCase + 접미사 | UserType |"
```

---

## 🔧 ESLint 설정

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // 한 줄 최대 길이
    'max-len': ['warn', { code: 100 }],
    // 사용하지 않는 변수 경고
    '@typescript-eslint/no-unused-vars': 'warn',
    // console.log 경고
    'no-console': 'warn',
    // 세미콜론 필수
    'semi': ['error', 'always'],
  }
}
```

---

## 🎨 Prettier 설정

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

---

## 📁 파일 구조 패턴

```
"컴포넌트 파일 구조 패턴을 정의해줘:

방법 1: 단일 파일
components/
├── Button.tsx
└── Input.tsx

방법 2: 폴더 방식
components/
├── Button/
│   ├── index.tsx
│   ├── Button.styles.ts
│   └── Button.test.tsx"
```

---

## 💬 주석 규칙

```typescript
/**
 * 사용자 정보를 가져오는 함수
 * @param userId - 사용자 고유 ID
 * @returns 사용자 정보 객체
 */
async function getUser(userId: string): Promise<User> {
  // 캐시된 데이터 확인
  const cached = cache.get(userId);
  if (cached) return cached;
  
  // API에서 데이터 가져오기
  const user = await api.fetchUser(userId);
  
  // TODO: 에러 처리 추가 필요
  return user;
}
```

---

[목차로 돌아가기](./00_INDEX.md)
