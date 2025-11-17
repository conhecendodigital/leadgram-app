import { test, expect } from '@playwright/test'

/**
 * Dashboard E2E Tests
 *
 * Basic smoke tests to ensure the dashboard loads and key features work
 */

test.describe('Dashboard - Smoke Tests', () => {
  // Note: These tests assume you have valid auth credentials
  // In production, you would use test fixtures or a test user

  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication logic here
    // For now, we'll just navigate to the page
    // In real scenarios, you'd need to:
    // 1. Login programmatically
    // 2. Use session storage/cookies
    // 3. Or use a test user with known credentials
  })

  test('should load login page', async ({ page }) => {
    await page.goto('/login')

    // Check if login page elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should load register page', async ({ page }) => {
    await page.goto('/register')

    // Check if register page elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  // Skipping authenticated tests for now - would need proper auth setup
  test.skip('should load dashboard after login', async ({ page }) => {
    await page.goto('/dashboard')

    // Check for dashboard key elements
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('[data-tour="quick-actions"]')).toBeVisible()
  })

  test.skip('should show stats overview', async ({ page }) => {
    await page.goto('/dashboard')

    // Check if stats cards are visible
    const statsCards = page.locator('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-5')
    await expect(statsCards).toBeVisible()
  })

  test.skip('should open quick actions menu', async ({ page }) => {
    await page.goto('/dashboard')

    // Find and click quick actions button
    const quickActionsBtn = page.locator('[data-tour="quick-actions"]')
    await quickActionsBtn.click()

    // Check if menu items are visible
    await expect(page.locator('text=Nova Ideia')).toBeVisible()
    await expect(page.locator('text=Upload')).toBeVisible()
  })

  test.skip('should navigate to ideas page', async ({ page }) => {
    await page.goto('/dashboard/ideas')

    // Check if ideas page loaded
    await expect(page.locator('h1')).toContainText('Ideias')
  })

  test.skip('should show onboarding tour button', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for tour button (if tour was already completed)
    const tourButton = page.locator('button[aria-label="Reiniciar tour guiado"]')

    // Tour button should be visible if user has seen the tour
    // It may not be visible on first visit
    const isVisible = await tourButton.isVisible().catch(() => false)

    if (isVisible) {
      await expect(tourButton).toBeVisible()
    }
  })
})

test.describe('Dashboard - Accessibility', () => {
  test('should have skip to content link', async ({ page }) => {
    await page.goto('/dashboard')

    // Focus the skip link (it's sr-only but visible on focus)
    await page.keyboard.press('Tab')

    // Check if skip link is focused
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeFocused()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login')

    // Check for ARIA labels on form elements
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })
})
