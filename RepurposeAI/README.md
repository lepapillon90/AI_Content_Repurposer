# ✨ RepurposeAI

**RepurposeAI**는 하나의 긴 콘텐츠를 다양한 소셜 매디어 플랫폼에 최적화된 형식으로 즉시 변환해주는 AI 기반 콘텐츠 매니지먼트 도구입니다. 블로그 글이나 기사를 입력하면 Twitter 쓰레드, LinkedIn 포스트, YouTube 쇼츠 대본 등으로 재가공하며, 바이럴 가능성을 분석하여 정교한 피드백을 제공합니다.

---

## 🚀 주요 기능

### 1. 멀티 플랫폼 리퍼포징 (Multi-platform Support)
- **텍스트 기반**: Twitter Threads, LinkedIn Post, Instagram Feed, Naver Blog.
- **영상 기반**: YouTube Shorts, Instagram Reels, TikTok Script (구조화된 테이블 형식 제공).

### 2. AI 바이럴 분석 (Viral Pillar Analysis)
- **Viral Score**: 콘텐츠의 성공 가능성을 0-100점 사이로 산출.
- **4대 핵심 지표**:
    - **Hook**: 초반 시선 강탈 및 이탈 방지 전략.
    - **Value**: 독자에게 전달되는 정보의 가치와 흥미.
    - **Structure**: 플랫폼에 최적화된 가독성 및 호흡.
    - **CTA**: 명확한 행동 유도 및 전환율 최적화.

### 3. 인터랙티브 피드백
- **상세 분석 모달**: 각 지표(Hook, Value 등) 뱃지를 클릭하면 AI가 해당 점수를 부여한 구체적인 이유와 개선 코멘트를 팝업으로 제공합니다.
- **추천 태그**: 플랫폼에 적합한 해시태그를 AI가 추천하며, 원클릭으로 일괄 복사할 수 있습니다.

### 4. 히스토리 및 대시보드
- 과거에 생성한 콘텐츠와 분석 데이터를 브라우저에 안전하게 저장합니다.
- 대시보드 통계판을 통해 전체적인 콘텐츠 생산성과 평균 성과를 한눈에 파악할 수 있습니다.

### 5. 사용자 경험 (UX)
- **Dark Mode**: 눈이 편안한 다크 모드 지원.
- **Mobile Optimized**: 모바일 기기에서도 매끄러운 스크롤과 최적화된 레이아웃 제공.
- **Premium UI**: 글래스모피즘과 부드러운 애니메이션이 적용된 현대적인 디자인.

---

## 🛠 Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS
- **Styling**: Tailwind CSS (via CDN)
- **AI Models**: Google Gemini 1.5 Flash, OpenAI GPT-4o
- **Typography**: Inter (Google Fonts)
- **Icons**: Lucide Icons
- **Persistence**: LocalStorage

---

## 🏃 시작하기

### 1. 로컬 환경 실행
- `index.html` 파일을 브라우저로 엽니다. (VS Code의 **Live Server** 확장을 권장합니다.)

### 2. API 키 설정
- 앱 실행 후 사이드바의 **Settings** 메뉴로 이동합니다.
- 사용하려는 AI 서비스(Google Gemini 또는 OpenAI)의 API 키를 입력하고 저장합니다. (키는 브라우저의 `localStorage`에만 저장됩니다.)

### 3. 콘텐츠 생성
- **Create** 메뉴에서 원문 텍스트를 입력하고 플랫폼을 선택한 후 **Generate** 버튼을 누르세요.

---

## 📂 프로젝트 구조

- `index.html`: 메인 애플리케이션 구조 및 SPA 라우팅.
- `css/`: 스타일 시트 (Main/Dark Mode/Widget styles).
- `js/`: 
    - `app.js`: 메인 로직 및 UI 인터랙션.
    - `ai.js`: LLM API 연동 및 프롬프트 엔지니어링.
    - `components.js`: 공통 UI 컴포넌트 (Sidebar, Modal 등).
    - `brand.js`: 브랜드 보이스 및 설정 관리.
- `assets/`: 이미지 및 정적 리소스.

---

## 📑 라이선스 및 배포
이 프로젝트는 개인 프로젝트로 개발되었으며, 상세한 배포 가이드는 `DEPLOY.md`를 참조하세요.
