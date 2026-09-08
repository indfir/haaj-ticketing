import { test, expect } from "@playwright/test";

test.describe("Registration → Ticket → Check-in Happy Path", () => {
  test("visitor registers, receives ticket, and checks in via API", async ({ page }) => {
    // 1. Visit events index
    await page.goto("/events");
    await expect(page.locator("h1")).toContainText("Events");

    // 2. Click on first published event
    const firstEventLink = page.locator('a[href^="/events/"]').first();
    await expect(firstEventLink).toBeVisible();
    const eventHref = await firstEventLink.getAttribute("href");
    await firstEventLink.click();

    // 3. Event detail page loads
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Registration")).toBeVisible();

    // 4. Fill registration form
    await page.fill('input[name="fullName"]', "Playwright Test User");
    await page.fill('input[name="email"]', `playwright-${Date.now()}@test.com`);
    await page.fill('input[name="phone"]', "+628123456789");

    // 5. Submit registration
    await page.click('button[type="submit"]');

    // 6. Should redirect to ticket page
    await page.waitForURL(/\/t\/HAAJ-/);
    await expect(page.locator("text=HAAJ-")).toBeVisible();

    // 7. Extract ticket code from URL
    const ticketUrl = page.url();
    const ticketCode = ticketUrl.split("/t/")[1];
    expect(ticketCode).toMatch(/^HAAJ-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

    // 8. Verify QR code is displayed
    const qrImage = page.locator("img[alt*='QR code']");
    await expect(qrImage).toBeVisible();

    // 9. Verify ticket code is displayed
    await expect(page.locator(`text=${ticketCode}`)).toBeVisible();

    // 10. Admin logs in
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', "admin@haaj.id");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");

    // 11. Check-in via API (simulating scanner)
    const checkinResponse = await page.evaluate(async (code) => {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: code }),
      });
      return res.json();
    }, ticketCode);

    // 12. Verify check-in succeeded
    expect(checkinResponse.alreadyCheckedIn).toBe(false);
    expect(checkinResponse.registration.ticketCode).toBe(ticketCode);
    expect(checkinResponse.checkIn).toBeDefined();

    // 13. Second check-in should report "already checked in"
    const secondCheckin = await page.evaluate(async (code) => {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: code }),
      });
      return res.json();
    }, ticketCode);

    expect(secondCheckin.alreadyCheckedIn).toBe(true);
  });
});
