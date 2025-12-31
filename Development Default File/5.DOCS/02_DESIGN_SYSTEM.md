# 🎨 02_DESIGN_SYSTEM.md

> **브랜드 아이덴티티**: 전문적인, 신뢰할 수 있는, 모던한, 깔끔한.

---

## 1. 색상 팔레트

### Primary (브랜드)
주요 액션, 활성 상태, 포커스 링에 사용됩니다.
*   **Deep Blue**: `#1E40AF` (Tailwind `blue-800`)
*   **Hover**: `#1E3A8A` (Tailwind `blue-900`)

### Secondary (강조)
*   **Cyan Accent**: `#06B6D4` (Tailwind `cyan-500`) - 미묘한 하이라이트나 "AI" 효과용.

### Neutral / 배경
*   **메인 배경**: `#F3F4F6` (Tailwind `gray-100`) - 부드럽고 눈이 편안함.
*   **카드 배경**: `#FFFFFF` (White) - 깔끔하고 선명한 룩.
*   **텍스트 기본**: `#111827` (Tailwind `gray-900`)
*   **텍스트 보조**: `#6B7280` (Tailwind `gray-500`)

---

## 2. 타이포그래피
**폰트 패밀리**: `Inter` (Google Fonts) - 높은 가독성과 모던한 느낌을 위해 선택.

### 스케일
*   **Heading 1 (로고/제목)**: `text-3xl`, `font-bold`, `tracking-tight`.
*   **Heading 2 (섹션)**: `text-xl`, `font-semibold`.
*   **Body**: `text-base`, `leading-relaxed`.
*   **Button**: `text-sm`, `font-medium`.

---

## 3. UI 컴포넌트

### 버튼
*   **Primary**: 둥근 모서리(`rounded-lg`), 그림자(`shadow-md`), 전환 효과(`transition-all`).
    *   `bg-blue-800 text-white hover:bg-blue-900 hover:shadow-lg`
*   **Secondary/아이콘**: 투명 배경, 호버 틴트.
    *   `text-gray-500 hover:text-blue-800 hover:bg-blue-50`

### 카드 (Glassmorphism Lite)
*   미세한 테두리와 그림자가 있는 흰색 배경.
*   `bg-white rounded-xl shadow-sm border border-gray-200`

### 입력 필드
*   깔끔한 테두리, 기본 색상과 일치하는 포커스 링.
*   `border-gray-300 focus:ring-2 focus:ring-blue-800 focus:border-transparent`

---

## 4. 간격 및 레이아웃
*   **컨테이너**: `max-w-4xl` 중앙 정렬.
*   **그리드**:
    *   모바일: 단일 컬럼 `grid-cols-1`
    *   데스크톱: 1:1 분할 `md:grid-cols-2`
*   **패딩**: `p-6` 또는 `p-8`로 충분한 여백 확보.
