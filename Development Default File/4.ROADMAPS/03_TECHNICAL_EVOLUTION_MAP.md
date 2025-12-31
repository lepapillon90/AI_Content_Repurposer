# 🛠️ 03_TECHNICAL_EVOLUTION_MAP.md

> **전략**: 바닐라 JS로 가볍게 시작하고, 복잡성이 증가함에 따라 강력한 React/Next.js 아키텍처로 마이그레이션합니다.

---

## 🏗️ 1단계: 린 프로토타입 (현재)
*   **코어**: HTML5, Vanilla JavaScript (ES6+).
*   **스타일링**: CDN을 통한 Tailwind CSS (스크립트 태그).
*   **배포**: 정적 호스팅 (GitHub Pages / Netlify Drop).
*   **장점**: 빌드 시간 없음, 즉시 배포, 이해하기 쉬움.
*   **단점**: 컴포넌트 재사용 불가, 상태 복잡성 관리 어려움, 제한적인 API 보안.

---

## 🔄 2단계: 모던 마이그레이션 (Next.js)
*트리거: API 보호(서버 사이드 호출)나 복잡한 상태 관리가 필요할 때.*

### 마이그레이션 단계
1.  **초기화**: TypeScript와 함께 `npx create-next-app@latest` 실행.
2.  **포팅**:
    - HTML 섹션을 React 컴포넌트로 변환 (`<Header />`, `<InputArea />`).
    - `style.css`를 Tailwind PostCSS 구성으로 이동.
3.  **API 프록시**:
    - 클라이언트에서 API 키를 숨기기 위해 `app/api/generate/route.ts` 생성.
    - Upstash 또는 KV를 사용하여 속도 제한(Rate Limiting) 구현.

---

## 🧱 3단계: 엔터프라이즈 확장
*트리거: 월간 활성 사용자(MAU) 1만 명 도달 또는 사용자 계정 도입 시.*

### 아키텍처 업그레이드
- **백엔드 서비스**:
    - **데이터베이스**: 사용자 데이터를 위한 Supabase (PostgreSQL) 또는 Firebase Firestore.
    - **차세대 기능**: 사용자의 과거 콘텐츠 스타일을 "기억"하기 위한 벡터 데이터베이스 통합 (Pinecone).
- **테스트**:
    - Playwright를 사용한 E2E 테스트.
    - Vitest를 사용한 유닛 테스트.
- **DevOps**:
    - CI/CD 파이프라인 (GitHub Actions).
    - 자동화된 린팅 및 포맷팅 (Husky).

---

## 📊 기술 스택 요약표

| 구성 요소 | MVP (1단계) | 성장 (2단계) | 확장 (3단계) |
|-----------|---------------|------------------|-----------------|
| **프레임워크** | Vanilla JS | Next.js (App Router) | Next.js + Turborepo |
| **스타일링** | Tailwind (CDN) | Tailwind (PostCSS) | Tailwind + Shadcn/UI |
| **백엔드** | Mock / Browser | Next.js API Routes | Node.js / Supabase |
| **데이터베이스** | LocalStorage | LocalStorage | PostgreSQL / Redis |
| **AI 운영** | Simulation | Direct API | LangChain / RAG |
