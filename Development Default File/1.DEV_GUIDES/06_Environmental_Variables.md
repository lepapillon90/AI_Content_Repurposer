# 🔐 Environmental Variables Manager (환경 변수 관리)
> 안전한 환경 변수 설정 및 관리 가이드

---

## 🎯 환경 변수 설정 요청

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

## 📁 환경 변수 파일 구조

```
프로젝트 루트/
├── .env                 # 기본값 (공유 가능)
├── .env.local           # 로컬 개발용 (gitignore)
├── .env.development     # 개발 환경
├── .env.staging         # 스테이징 환경
├── .env.production      # 프로덕션 환경
└── .env.example         # 예시 파일 (공유용)
```

---

## 🔧 환경 변수 템플릿

```bash
# .env.example

# ===================
# Firebase 설정
# ===================
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ===================
# API 설정
# ===================
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_SECRET_KEY=your_secret_key

# ===================
# 기타 설정
# ===================
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

---

## 🔒 보안 규칙

```
"환경 변수 보안 규칙을 정의해줘:

1. 절대 커밋하면 안 되는 것:
   - API 비밀 키
   - 데이터베이스 비밀번호
   - JWT 시크릿
   - 서드파티 API 키

2. NEXT_PUBLIC_ 접두사:
   - 클라이언트에서 접근 가능
   - 민감하지 않은 정보만

3. 서버 전용 변수:
   - 접두사 없이 사용
   - API Routes에서만 접근"
```

---

## 📋 .gitignore 설정

```gitignore
# 환경 변수 파일
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# .env.example은 커밋 가능
!.env.example
```

---

## 🔧 타입 안전한 환경 변수

```typescript
// env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
] as const;

// 환경 변수 검증
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`필수 환경 변수가 없습니다: ${key}`);
  }
});

// 타입 안전한 접근
export const env = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    // ...
  },
  isProduction: process.env.NODE_ENV === 'production',
};
```

---

## 🚀 배포 환경 변수 설정

```
"각 배포 플랫폼별 환경 변수 설정 방법:

1. Vercel
   - Settings > Environment Variables
   - 환경별 구분 가능

2. Firebase Hosting
   - firebase functions:config:set
   
3. AWS Amplify
   - App settings > Environment variables"
```

---

[목차로 돌아가기](./00_INDEX.md)
