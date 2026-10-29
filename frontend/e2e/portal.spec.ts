import { test, expect } from '@playwright/test';
const password = process.env.E2E_PASSWORD;
test.skip(!password, 'Set E2E_PASSWORD to the development seed password.');
async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password!);
  await page.getByRole('button', { name: 'Sign in to your account' }).click();
}
test('admin and student portals use real API sessions', async ({ page }) => {
  await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@ncc.local');
  await expect(page).toHaveURL(/admin\/dashboard/);
  await expect(page.getByText('Total students', { exact: true })).toBeVisible();
  await page.screenshot({
    animations: 'disabled',
    timeout: 10000,
    path: '../artifacts/admin_dashboard.png',
    fullPage: true,
  });
  await page.getByRole('link', { name: 'Students', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your cadets. Tomorrow’s leaders.' }),
  ).toBeVisible();
  await page.getByLabel('Search students').fill('Aarav');
  await expect(
    page.getByRole('cell').filter({ hasText: 'Aarav Sharma' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Programs', exact: true }).click();
  await page
    .getByRole('button', { name: 'Create program', exact: true })
    .click();
  await page.getByLabel('Program title').fill(`Browser Training ${Date.now()}`);
  await page.getByLabel('Camp location').fill('Test Training Ground');
  await page.getByLabel('Start date').fill('2026-11-01');
  await page.getByLabel('End date').fill('2026-11-08');
  await page
    .getByLabel('Short description', { exact: true })
    .fill('Practical leadership training for cadets.');
  await page
    .getByLabel('Eligibility requirements')
    .fill('Institutional approval required.');
  await page.getByRole('button', { name: 'Create draft program' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(
    page.getByRole('heading', { name: /Browser Training/ }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/login/);
  await login(page, 'cadet1@ncc.local');
  await expect(page).toHaveURL(/student\/dashboard/);
  await page
    .getByRole('link', { name: 'My certificates', exact: true })
    .click();
  const download = page.getByRole('link', { name: 'Download PDF' }).first();
  await expect(download).toBeVisible();
  const response = await page.request.get(
    (await download.getAttribute('href'))!,
  );
  expect(response.status()).toBe(200);
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await page.screenshot({
    animations: 'disabled',
    timeout: 10000,
    path: '../artifacts/student_certificates.png',
    fullPage: true,
  });
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/student\/dashboard/);
  const forbidden = await page.request.get('/api/v1/admin/students');
  expect(forbidden.status()).toBe(403);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(
    page.getByRole('heading', { name: /Keep moving forward/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(
    page.getByRole('link', { name: 'My profile', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'My profile', exact: true }).click();
  await page.getByLabel('Mobile number').fill('919000000099');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Your profile has been updated.')).toBeVisible();
  await page.screenshot({
    animations: 'disabled',
    timeout: 10000,
    path: '../artifacts/mobile_profile.png',
    fullPage: true,
  });
});

test('a separate worker generates a new eligible certificate', async ({
  page,
}) => {
  await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@ncc.local');
  await expect(page).toHaveURL(/admin\/dashboard/);
  const csrf = await page.request.get('/api/v1/auth/csrf');
  const headers = { 'X-CSRF-Token': (await csrf.json()).data.csrf_token };
  const students = await page.request.get('/api/v1/admin/students?q=Aarav');
  const user = (await students.json()).data[0];
  const created = await page.request.post('/api/v1/admin/programs', {
    headers,
    data: {
      program: {
        title: `Worker Verification ${Date.now()}`,
        start_date: '2026-11-01',
        end_date: '2026-11-03',
        location: 'Verification Camp',
        capacity: 2,
        eligibility_criteria: 'Administrator approval',
      },
    },
  });
  expect(created.status()).toBe(200);
  const program = (await created.json()).data;
  expect(
    (
      await page.request.post(`/api/v1/admin/programs/${program.id}/publish`, {
        headers,
      })
    ).status(),
  ).toBe(200);
  const assigned = await page.request.post(
    `/api/v1/admin/programs/${program.id}/enrollments`,
    { headers, data: { user_id: user.id, eligibility_confirmed: true } },
  );
  expect(assigned.status()).toBe(200);
  const enrollment = (await assigned.json()).data[0];
  expect(
    (
      await page.request.patch(
        `/api/v1/admin/enrollments/${enrollment.id}/progress`,
        { headers, data: { progress_percent: 100 } },
      )
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.post(
        `/api/v1/admin/enrollments/${enrollment.id}/complete`,
        { headers },
      )
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.post(`/api/v1/admin/programs/${program.id}/start`, {
        headers,
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.post(`/api/v1/admin/programs/${program.id}/complete`, {
        headers,
      })
    ).status(),
  ).toBe(200);
  let certificate: { id: number; pdf_ready: boolean } | undefined;
  await expect
    .poll(
      async () => {
        const response = await page.request.get(
          `/api/v1/admin/students/${user.id}/certificates`,
        );
        certificate = (await response.json()).data.find(
          (c: { enrollment_id: number }) => c.enrollment_id === enrollment.id,
        );
        return certificate?.pdf_ready;
      },
      { timeout: 20000 },
    )
    .toBe(true);
  const pdf = await page.request.get(
    `/api/v1/admin/certificates/${certificate!.id}/download`,
  );
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('an invited cadet activates through the emailed setup link', async ({
  page,
}) => {
  test.skip(
    !process.env.E2E_MAIL_DIR,
    'Set E2E_MAIL_DIR to the native Rails file-mail directory.',
  );
  const email = `browser-cadet-${Date.now()}@example.test`;
  await login(page, process.env.E2E_ADMIN_EMAIL || 'admin@ncc.local');
  await expect(page).toHaveURL(/admin\/dashboard/);
  await page
    .getByRole('link', { name: 'Register student', exact: true })
    .click();
  await page.getByLabel('Full name').fill('Browser Invited Cadet');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Date of birth').fill('2006-01-01');
  await page.getByLabel('Mobile number').fill('919000000088');
  await page
    .getByLabel('Institution', { exact: true })
    .fill('Browser Test College');
  await page.getByLabel('Course / class').fill('Undergraduate');
  await page.getByLabel('Gender').selectOption('Female');
  await page
    .getByRole('button', { name: 'Register & send invitation' })
    .click();
  await expect(page.getByRole('dialog')).toBeHidden();
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const message = readFileSync(join(process.env.E2E_MAIL_DIR!, email), 'utf8')
    .replace(/=\r?\n/g, '')
    .replaceAll('=3D', '=');
  const token = message.match(/reset-password\?token=([^"<>\s]+)/)?.[1];
  expect(token).toBeTruthy();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto(`/reset-password?token=${token}`);
  await page.getByLabel('New password', { exact: true }).fill(password!);
  await page.getByLabel('Confirm password').fill(password!);
  await page.getByRole('button', { name: 'Save password' }).click();
  await expect(
    page.getByText('Password saved. You can sign in.'),
  ).toBeVisible();
  await login(page, email);
  await expect(page).toHaveURL(/student\/dashboard/);
  await expect(
    page.getByRole('heading', { name: 'Keep moving forward, Browser.' }),
  ).toBeVisible();
});
