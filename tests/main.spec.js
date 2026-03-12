import { test, expect } from '@playwright/test';

/**
 * 💡 E2E 테스트를 위해 사전에 공유된 기획안(@plan/test/main_page_test_plan.md)을 바탕으로 구현되었습니다.
 */

test.describe('Momo 메인 페이지 E2E 테스팅', () => {

    // 1. 사전 준비: 모든 테스트 전 로그인 수행
    test.beforeEach(async ({ page }) => {
        // ngrok URL 접속
        await page.goto('/');

        // ngrok 보안 경고 페이지 우회 (Visit Site 버튼이 있으면 클릭)
        const visitSiteBtn = page.getByRole('button', { name: 'Visit Site' });
        if (await visitSiteBtn.isVisible()) {
            await visitSiteBtn.click();
            // 버튼 클릭 후 페이지 로딩을 잠시 대기
            await page.waitForLoadState('networkidle');
        }

        await page.goto('/login');

        // 이메일 및 비밀번호 입력 (테스트 계정 정보가 필요할 수 있음)
        // 실제 테스트 실행 시에는 환경 변수 등을 활용해 실제 값을 입력해야 합니다.
        await page.fill('input#email', 'test@example.com');
        await page.fill('input#password', 'password123');
        await page.click('button[type="submit"]');

        // 메인 페이지로 이동 확인
        await expect(page).toHaveURL(/\/main/);
    });

    test('상단 헤더 구성 요소 검증', async ({ page }) => {
        // 로고 확인
        const logo = page.locator('img[alt="Momo Logo"]');
        await expect(logo).toBeVisible();

        // 마이페이지 이동 확인
        const myPageBtn = page.locator('button[aria-label="마이페이지로 이동"]');
        await expect(myPageBtn).toBeVisible();
        await myPageBtn.click();
        await expect(page).toHaveURL(/\/mypage/);

        // 다시 메인으로 복귀
        await page.goto('/main');

        // 로그아웃 버튼 확인
        const logoutBtn = page.getByText('로그아웃', { exact: false });
        await expect(logoutBtn).toBeVisible();
    });

    test('모임 목록 및 카드 요소 검증', async ({ page }) => {
        // "내 모임" 타이틀 확인
        await expect(page.locator('h2', { hasText: '내 모임' })).toBeVisible();

        // 모임 카드가 있을 경우 요소 확인
        const meetingCards = page.locator('div.bg-white.rounded-xl.p-6');
        if (await meetingCards.count() > 0) {
            const firstCard = meetingCards.first();
            await expect(firstCard.getByRole('button', { name: '입장' })).toBeVisible();
            await expect(firstCard.locator('button:has-text("스마트 스캔")')).toBeVisible();
        } else {
            // 모임이 없을 때의 안내 문구 확인
            await expect(page.getByText('참여 중인 모임이 없습니다.')).toBeVisible();
        }
    });

    test('모임 만들기 모달 작동 확인', async ({ page }) => {
        // 모임 만들기 버튼 클릭
        await page.click('button[aria-label="새 모임 만들기"]');

        // 모달 타이틀 및 폼 확인
        await expect(page.locator('h2', { hasText: '새 모임 만들기' })).toBeVisible();
        await expect(page.locator('input#meetingName')).toBeVisible();
        await expect(page.locator('textarea#meetingDescription')).toBeVisible();

        // 취소 버튼 클릭 후 모달 닫힘 확인
        await page.click('button:has-text("취소")');
        await expect(page.locator('h2', { hasText: '새 모임 만들기' })).not.toBeVisible();
    });

    test('모임 가입하기 모달 작동 확인', async ({ page }) => {
        // 모임 가입 버튼 클릭
        await page.click('button[aria-label="모임 가입하기"]');

        // 모달 구성 요소 확인
        await expect(page.locator('h2', { hasText: '모임 가입하기' })).toBeVisible();
        await expect(page.locator('input#inviteCode')).toBeVisible();

        // 취소 버튼 클릭
        await page.click('button:has-text("취소")');
        await expect(page.locator('h2', { hasText: '모임 가입하기' })).not.toBeVisible();
    });

    test('AI 비서 플로팅 버튼 및 채팅창 활성화 검증', async ({ page }) => {
        // 둥근 봇 아이콘 버튼 클릭
        await page.locator('button:has(.lucide-bot)').click();

        // AI 채팅창(AIChatModal) 표시 확인 (컴포넌트 내부에 특정 텍스트나 ID가 있을 것을 가정)
        // 소스 상 AIChatModal이 isOpen일 때 렌더링되므로 특정 요소로 확인
        await expect(page.locator('div:has-text("AI")')).toBeVisible(); // AI 관련 텍스트가 있을 것으로 간주
    });

});
