import { test, expect } from '@playwright/test'

/**
 * Smoke Tests - Basic application health checks
 *
 * These tests ensure the application is running and basic pages load correctly
 */

test.describe('Application Health', () => {
  test('should load homepage/login without errors', async ({ page }) => {
    const response = await page.goto('/login')

    // Check that page loaded successfully
    expect(response?.status()).toBeLessThan(400)

    // Check for no console errors (excluding warnings)
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait a bit for any errors to appear
    await page.waitForTimeout(1000)

    // No critical errors should appear
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/login')

    // Check page title
    await expect(page).toHaveTitle(/Leadgram|Login/)
  })

  test('should load register page', async ({ page }) => {
    const response = await page.goto('/register')

    // Check successful load
    expect(response?.status()).toBe(200)
  })

  test('should have responsive meta tags', async ({ page }) => {
    await page.goto('/login')

    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })
})

test.describe('Navigation', () => {
  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/login')

    // Find and click register link
    const registerLink = page.locator('a[href="/register"], text=/criar conta|registrar|cadastr/i')

    // If register link exists, click it
    const count = await registerLink.count()
    if (count > 0) {
      await registerLink.first().click()

      // Should navigate to register page
      await expect(page).toHaveURL(/\/register/)
    }
  })
})

test.describe('Performance', () => {
  test('should load login page in reasonable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Page should load in under 10 seconds (generous for dev mode)
    expect(loadTime).toBeLessThan(10000)
  })
})

test.describe('SEO', () => {
  test('should have meta description', async ({ page }) => {
    await page.goto('/login')

    // Check for description meta tag
    const description = page.locator('meta[name="description"]')
    const count = await description.count()

    // Description should exist (not checking content as it may vary)
    expect(count).toBeGreaterThan(0)
  })

  test('should not have broken images', async ({ page }) => {
    await page.goto('/login')

    // Get all images
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      // Check each image loaded successfully
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i)
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)

        // If image is visible, it should have loaded (naturalWidth > 0)
        const isVisible = await img.isVisible().catch(() => false)
        if (isVisible) {
          expect(naturalWidth).toBeGreaterThan(0)
        }
      }
    }
  })
})
