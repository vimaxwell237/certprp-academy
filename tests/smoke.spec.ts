import { expect, test } from "@playwright/test";

test("homepage loads with core messaging and CTA links", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /learn faster, practice smarter/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Get Started" })).toHaveAttribute(
    "href",
    "/signup"
  );
  await expect(page.getByRole("link", { name: "Login" }).first()).toHaveAttribute(
    "href",
    "/login"
  );
});

test("public navigation links work", async ({ page }) => {
  await page.goto("/");

  await Promise.all([
    page.waitForURL("**/signup", { timeout: 15000 }),
    page.getByRole("link", { name: "Get Started" }).click()
  ]);
  await expect(
    page.getByRole("heading", { name: /create your account/i })
  ).toBeVisible();

  await Promise.all([
    page.waitForURL("**/login", { timeout: 15000 }),
    page.getByRole("link", { name: "Login" }).first().click()
  ]);
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("pricing page loads publicly", async ({ page }) => {
  await page.goto("/pricing");

  await expect(
    page.getByRole("heading", {
      name: /choose the certprep plan that matches your study path/i
    })
  ).toBeVisible();
});

test("dashboard redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("courses redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/courses");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("labs redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/labs");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("quizzes redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/quizzes");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("cli practice redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/cli-practice");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("support redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/support");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("tutors redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/tutors");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("exam simulator redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/exam-simulator");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("billing redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/billing");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("recommendations redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/recommendations");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("study plan redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/study-plan");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("book session redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/book-session");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("sessions redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/sessions");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("notifications redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/notifications");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("notification settings redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/settings/notifications");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("tutor schedule redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/tutor/schedule");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("tutor sessions redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/tutor/sessions");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("admin redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("admin operations redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/admin/operations");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("admin deliveries redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/admin/operations/deliveries");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});

test("admin jobs redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/admin/operations/jobs");

  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: /log in to your dashboard/i })
  ).toBeVisible();
});
