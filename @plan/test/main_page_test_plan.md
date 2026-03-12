# 메인 페이지 E2E 테스트 플랜

이 문서는 `https://lean-blotchiest-postvocalically.ngrok-free.dev/main` 페이지에 대한 Playwright 기반 E2E 테스트 시나리오를 정의합니다.

## 1. 사전 준비 (로그인)
메인 페이지는 보호된 경로(`ProtectedRoute`)이므로, 모든 테스트는 로그인이 완료된 상태에서 시작해야 합니다.

- **대상:** `/login`
- **조작 요소:**
  - 이메일 입력: `input#email` (placeholder: "이메일을 입력해주세요…")
  - 비밀번호 입력: `input#password` (placeholder: "비밀번호를 입력해주세요…")
  - 로그인 버튼: `button[type="submit"]` (텍스트: "로그인")
- **체크포인트:** 로그인 성공 후 `/main` 경로로 리다이렉트 되는지 확인.

---

## 2. 메인 페이지 구조 및 요소 테스트

### 2.1 헤더 (Header)
- **요소:**
  - 로고 이미지 (`alt="Momo Logo"`)
  - 마이페이지 버튼 (`aria-label="마이페이지로 이동"`)
  - 로그아웃 버튼 (텍스트: "로그아웃")
- **테스트 케이스:**
  - 마이페이지 버튼 클릭 시 `/mypage`로 이동하는지 확인.
  - 로그아웃 버튼 클릭 시 세션이 종료되고 `/login`으로 이동하는지 확인.

### 2.2 모임 목록 (Meeting List)
- **요소:**
  - "내 모임" 타이틀 (`h2`)
  - 모임 카드 (개별 모임 정보 표시)
    - "입장" 버튼: 클릭 시 `/meeting/:id/schedule`로 이동.
    - "스마트 스캔" 버튼: 클릭 시 `/meeting/:id/ocr`로 이동.
    - "탈퇴" 버튼: (방장이 아닐 경우) 클릭 시 컨펌 창이 뜨고 탈퇴 처리되는지 확인.
- **테스트 케이스:**
  - 모임이 없을 때의 안내 문구("참여 중인 모임이 없습니다.")가 올바르게 노출되는지 확인.
  - 모임 카드가 존재할 경우 각 버튼의 동작 확인.

### 2.3 모임 만들기 (Create Meeting)
- **대상:** "모임 만들기" 버튼 (`aria-label="새 모임 만들기"`)
- **조작 요소 (모달):**
  - 모임 이름 입력: `input#meetingName` (placeholder: "예: 독서 모임…")
  - 모임 설명 입력: `textarea#meetingDescription` (placeholder: "모임에 대한 간단한 설명을 적어주세요…")
  - 만들기 버튼: `button[type="submit"]` (텍스트: "만들기")
  - 취소 버튼: (텍스트: "취소")
- **테스트 케이스:**
  - 모달이 정상적으로 열리고 닫히는지 확인.
  - 필수 값 미입력 시 폼 유효성 검사가 작동하는지 확인.
  - 모임 생성 후 목록에 새 모임이 추가되는지 확인.

### 2.4 모임 가입 (Join Meeting)
- **대상:** "모임 가입" 버튼 (`aria-label="모임 가입하기"`)
- **조작 요소 (모달):**
  - 초대 코드 입력: `input#inviteCode` (placeholder: "초대 코드를 입력하세요…")
  - 가입 신청 버튼: `button[type="submit"]` (텍스트: "가입 신청")
- **테스트 케이스:**
  - 초대 코드를 입력하고 가입 신청이 정상적으로 백엔드에 전달되는지 확인.

### 2.5 AI 비서 (AI Chat)
- **대상:** 우측 하단 플로팅 버튼 (`Bot` 아이콘)
- **테스트 케이스:**
  - 클릭 시 AI 채팅 모달(`AIChatModal`)이 화면에 나타나는지 확인.

---

## 3. 테스트 환경 정보
- **Base URL:** `https://lean-blotchiest-postvocalically.ngrok-free.dev`
- **사용 도구:** Playwright, Playwright MCP
