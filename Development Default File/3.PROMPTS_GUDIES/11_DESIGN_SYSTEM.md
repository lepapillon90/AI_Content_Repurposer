# 11. 디자인 시스템 요청
> 앱의 일관된 디자인을 위한 시스템 설계 프롬프트

---

## 🎨 색상 팔레트 요청

```
"우리 앱의 색상 팔레트를 정의해줘.

포함할 색상:
- Primary Color: 메인 브랜드 색상
- Secondary Color: 보조 색상
- Accent Color: 강조 색상
- Background Colors: 배경색 (라이트/다크)
- Text Colors: 텍스트 색상 (제목/본문/비활성)
- Status Colors: 성공/경고/에러/정보

각 색상의 HEX 코드와 사용 용도를 알려줘."
```

---

## 🔤 타이포그래피 스타일

```
"우리 앱의 타이포그래피 시스템을 정의해줘:

1. 폰트 패밀리
   - 한글: [Pretendard, Noto Sans KR 등]
   - 영문: [Inter, Roboto 등]
   
2. 폰트 사이즈 체계
   - H1, H2, H3 (제목)
   - Body1, Body2 (본문)
   - Caption (캡션)
   - Button (버튼)

3. 폰트 웨이트
   - Bold, Medium, Regular

각 스타일의 사이즈(px/rem)와 line-height를 포함해줘."
```

---

## 🧩 컴포넌트 스타일

```
"우리 앱의 공통 UI 컴포넌트 스타일을 정의해줘:

1. 버튼 (Button)
   - Primary, Secondary, Outline, Text 버튼
   - 크기: Large, Medium, Small
   - 상태: Default, Hover, Active, Disabled

2. 입력 필드 (Input)
   - 텍스트 입력, 검색, 비밀번호
   - 상태: Default, Focus, Error, Disabled

3. 카드 (Card)
   - 기본 카드, 이미지 카드, 리스트 카드

4. 모달/팝업

5. 토스트/스낵바

각 컴포넌트의 padding, border-radius, shadow 값을 포함해줘."
```

---

## 📏 간격 및 레이아웃 시스템

```
"앱의 간격(Spacing) 시스템을 정의해줘:

- 기본 단위: 4px 또는 8px 베이스
- Spacing Scale: xs, sm, md, lg, xl, 2xl
- 화면 여백 (Screen Padding)
- 컴포넌트 간 간격
- 그리드 시스템 (Column, Gutter)"
```

---

## 🌓 다크 모드 대응

```
"라이트 모드와 다크 모드의 색상 매핑을 정의해줘:

| 요소 | 라이트 모드 | 다크 모드 |
|------|------------|----------|
| 배경 | #FFFFFF | #121212 |
| 텍스트 | #1A1A1A | #E0E0E0 |
| ...

각 모드에서의 색상 대비(Contrast Ratio)도 확인해줘."
```

---

## 🎯 디자인 토큰 정의

```
"디자인 토큰(Design Token)을 JSON 형식으로 정의해줘:

{
  'colors': {...},
  'typography': {...},
  'spacing': {...},
  'borderRadius': {...},
  'shadows': {...}
}

Tailwind CSS 또는 CSS 변수로 사용할 수 있는 형식으로."
```

---

## 💡 디자인 시스템 심화 질문

```
"이 디자인 시스템의 접근성(A11y) 점수는?"
"색상 대비가 WCAG 기준을 충족하는지 확인해줘"
"반응형 디자인을 위한 브레이크포인트는?"
```

---

[← 이전: 와이어프레임](./10_WIREFRAME_REQUEST.md) | [목차](./00_INDEX.md) | [다음: 기술 스택 →](./12_TECH_STACK.md)
