import { test, expect } from '@playwright/test';

test('Verify login and register navigation', async ({ page }) => {
    // Navigate to home
    await page.goto('/');

    // Wait for the login link and click it
    const loginLink = page.locator('a:has-text("ログイン")');
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    // Verify we reached the login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator('h2:has-text("メールアドレスでログイン")')).toBeVisible();

    // Go back
    await page.goto('/');

    // Wait for the register link and click it
    const registerLink = page.locator('a:has-text("新規登録")');
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    // Verify we reached the register page
    await expect(page).toHaveURL(/.*\/auth\/register/);
    await expect(page.locator('h2:has-text("農薬レビューを始めよう")')).toBeVisible();
});
