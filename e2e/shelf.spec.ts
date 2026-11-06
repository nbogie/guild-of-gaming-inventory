import { expect, test, type Page } from '@playwright/test'

const count = (page: Page) => page.locator('.results-count')
const titles = (page: Page) => page.locator('.card-title')

test.describe('search, filter, sort', () => {
  test('shows the whole shelf by default, sorted by title', async ({ page }) => {
    await page.goto('/')
    await expect(count(page)).toHaveText(/All \d+ games on the shelf/)
    const first = await titles(page).first().textContent()
    expect(first).toMatch(/^7 Wonders/)
  })

  test('title search narrows results and ignores descriptions', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Search titles').fill('wingspan')
    await expect(count(page)).toHaveText(/^2 of \d+ games$/)
    await page.getByPlaceholder('Search titles').fill('card drafting')
    await expect(page.locator('.empty')).toBeVisible()
    await page.locator('.empty').getByRole('button', { name: 'Clear all' }).click()
    await expect(count(page)).toHaveText(/All \d+ games/)
  })

  test('player stepper and time band combine', async ({ page }) => {
    await page.goto('/')
    const more = page.getByRole('button', { name: 'More players' })
    for (let i = 0; i < 5; i++) await more.click()
    await expect(page.locator('.stepper-num')).toHaveText('6')
    await page.getByRole('button', { name: 'About an hour' }).click()
    await expect(count(page)).toHaveText(/^\d+ of \d+ games$/)
    const shown = await titles(page).allTextContents()
    expect(shown).toContain('Castle Panic')
    expect(shown).not.toContain('Stratego')
  })

  test('category chips match any selected category', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Party & Word', exact: true }).click()
    const party = await titles(page).count()
    expect(party).toBeGreaterThan(0)
    await page.getByRole('button', { name: 'Co-operative', exact: true }).click()
    expect(await titles(page).count()).toBeGreaterThan(party)
  })

  test('sort options reorder the results', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Sort by').selectOption('playtime')
    expect(await titles(page).first().textContent()).toMatch(/^Codenames/)
    await page.getByLabel('Sort by').selectOption('complexity')
    expect(await titles(page).first().textContent()).toMatch(/^Block Party/)
    await page.getByLabel('Sort by').selectOption('age')
    expect(await titles(page).first().textContent()).toMatch(/^Dragonia/)
  })

  test('opening a card shows its details and a BGG link', async ({ page }) => {
    await page.goto('/?q=catan')
    await page.locator('.card-head').first().click()
    await expect(page.locator('.card-body')).toContainText('gateway game')
    await expect(page.getByRole('link', { name: 'See on BoardGameGeek' })).toHaveAttribute('href', 'https://boardgamegeek.com/boardgame/13')
  })
})

test.describe('links to a search', () => {
  test('opens pre-filtered from the query string', async ({ page }) => {
    await page.goto('/?cat=cooperative&time=hour&sort=playtime')
    await expect(page.getByRole('button', { name: 'Co-operative', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'About an hour' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByLabel('Sort by')).toHaveValue('playtime')
    await expect(count(page)).toHaveText(/^\d+ of \d+ games$/)
    const shown = await titles(page).allTextContents()
    expect(shown).toContain('Castle Panic')
    expect(shown).not.toContain('Stratego')
  })

  test('ignores junk in the query string', async ({ page }) => {
    await page.goto('/?players=99&time=forever&cat=nope&sort=random&utm_source=discord')
    await expect(count(page)).toHaveText(/All \d+ games/)
    await expect(page.locator('.stepper-num')).toHaveText('Any')
  })

  test('copy link asks first, then puts the search URL on the clipboard', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium only')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    await page.getByRole('button', { name: 'Co-operative', exact: true }).click()
    await page.getByRole('button', { name: 'More players' }).click()
    await page.getByRole('button', { name: 'More players' }).click()

    page.once('dialog', (d) => d.dismiss())
    await page.getByRole('button', { name: 'Copy link to this search' }).click()
    await expect(page.locator('.controls .status')).toHaveCount(0)

    page.once('dialog', (d) => d.accept())
    await page.getByRole('button', { name: 'Copy link to this search' }).click()
    await expect(page.locator('.controls .status')).toContainText('Link copied')
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(new URL(copied).search).toBe('?players=3&cat=cooperative')

    await page.goto(copied)
    await expect(page.locator('.stepper-num')).toHaveText('3')
    await expect(page.getByRole('button', { name: 'Co-operative', exact: true })).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('lists', () => {
  test('adding to a list persists and hide-not-for-me removes it from the shelf', async ({ page }) => {
    await page.goto('/?q=catan')
    await page.locator('.card-head').click()
    await page.getByRole('button', { name: 'Not for me', exact: true }).click()
    await page.reload()
    await page.locator('.card-head').click()
    await expect(page.getByRole('button', { name: 'Not for me', exact: true })).toHaveAttribute('aria-pressed', 'true')

    await page.getByLabel(/Hide games marked/).check()
    await expect(page.locator('.empty')).toBeVisible()
    await page.locator('.empty').getByRole('button', { name: 'Clear all' }).click()
    await expect(page.getByLabel(/Hide games marked/)).not.toBeChecked()
    await expect(count(page)).toHaveText(/All \d+ games/)
  })
})
