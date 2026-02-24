import { test, expect } from '@playwright/test';

test('Multi-stage search filtering works with URL sync', async ({ page }) => {
    // Navigate to the search page
    await page.goto('/pesticides/search');

    // Verify the page loaded
    await expect(page.locator('h2', { hasText: '検索する' })).toBeVisible();

    // 1. Check initial state (no pests)
    // Expand filter drawer if on mobile, else use desktop view
    const filterBtn = page.locator('button', { hasText: '絞り込みフィルター' });
    if (await filterBtn.isVisible()) {
        await filterBtn.click();
    }

    // The pest area should show the placeholder since no crops are selected
    await expect(page.locator('text=先に上の「適用作物」を選択してください')).toBeVisible();

    // 2. Select a crop
    await page.locator('text=トマト').first().click();

    // 3. Verify URL updated with the crop
    await expect(page).toHaveURL(/crops=%E3%83%88%E3%83%9E%E3%83%88/); // URL Encoded 'トマト'

    // 4. Verify pests dynamically loaded
    // The placeholder should be gone
    await expect(page.locator('text=先に上の「適用作物」を選択してください')).not.toBeVisible();

    // A pest like 'アブラムシ' should now be visible as an option
    const pestCheckbox = page.locator('text=アブラムシ').first();
    await expect(pestCheckbox).toBeVisible();

    // 5. Select the pest
    await pestCheckbox.click();

    // 6. Verify URL updated with the pest
    await expect(page).toHaveURL(/pests=%E3%82%A2%E3%83%96%E3%83%A9%E3%83%A0%E3%82%B7/); // URL Encoded 'アブラムシ'

    // 7. Verify the badge appears for the pest
    const pestBadge = page.locator('span', { hasText: '🐛 アブラムシ' });
    await expect(pestBadge).toBeVisible();

    // 8. Test "Clear All" URL sync
    await page.locator('button', { hasText: '全解除' }).click();

    // URL should be clean again
    await expect(page).toHaveURL(/\/pesticides\/search(?:(?!\?).)*$/);
});
