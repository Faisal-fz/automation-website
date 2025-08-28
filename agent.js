import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import { chromium } from 'playwright';

let browser, context, page;

async function ensurePage() {
  if (!browser) browser = await chromium.launch({ headless: false });
  if (!context) context = await browser.newContext();
  if (!page) page = await context.newPage();
  return page;
}

async function humanType(locator, text, perCharDelay = 80) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ timeout: 8000 });
  try {
    await locator.pressSequentially(text, { delay: perCharDelay });
  } catch {
    await locator.click({ timeout: 8000 });
    await page.keyboard.type(text, { delay: perCharDelay });
  }
}

const openBrowser = tool({
  name: 'openBrowser',
  description: 'Open a browser',
  parameters: z.object({}),
  async execute() { await ensurePage(); return 'Browser opened'; },
});

const closeBrowser = tool({
  name: 'closeBrowser',
  description: 'Close the browser',
  parameters: z.object({}),
  async execute() {
    if (page) { try { await page.close(); } catch {} page = null; }
    if (context) { try { await context.close(); } catch {} context = null; }
    if (browser) { try { await browser.close(); } catch {} browser = null; }
    return 'Browser closed';
  },
});

const goToMainPage = tool({
  name: 'goToMainPage',
  description: 'Navigate to ChaiCode main page',
  parameters: z.object({ waitMs: z.number().nullable().optional() }),
  async execute({ waitMs = 800 }) {
    const p = await ensurePage();
    await p.goto('https://ui.chaicode.com');
    await p.waitForLoadState('domcontentloaded');
    await p.waitForTimeout(waitMs);
    return 'Main page loaded';
  },
});

const navigateToSignup = tool({
  name: 'navigateToSignup',
  description: 'Click on signup link from current page and wait until form is interactive',
  parameters: z.object({ waitMs: z.number().nullable().optional() }),
  async execute({ waitMs = 800 }) {
    const p = await ensurePage();
    
    try {
      // Try different selectors to find the signup link/button
      let signupElement;
      
      // Try by role and name variations
      const selectors = [
        () => p.getByRole('link', { name: /sign up/i }),
        () => p.getByRole('link', { name: /signup/i }),
        () => p.getByRole('link', { name: /register/i }),
        () => p.getByRole('button', { name: /sign up/i }),
        () => p.getByRole('button', { name: /signup/i }),
        () => p.getByRole('button', { name: /register/i }),
        () => p.getByText(/sign up/i),
        () => p.getByText(/signup/i),
        () => p.locator('a[href*="signup"]'),
        () => p.locator('a[href*="register"]'),
        () => p.locator('[data-testid*="signup"]'),
        () => p.locator('.signup'),
        () => p.locator('#signup'),
      ];
      
      for (const selector of selectors) {
        try {
          signupElement = selector();
          await signupElement.waitFor({ state: 'visible', timeout: 2000 });
          break;
        } catch {
          continue;
        }
      }
      
      if (signupElement) {
        await signupElement.click();
      } else {
        // If no signup element found, try direct navigation as fallback
        console.log('Signup element not found, using direct navigation');
        await p.goto('https://ui.chaicode.com/auth/signup');
      }
    } catch (error) {
      // Fallback to direct navigation
      console.log('Error finding signup element, using direct navigation:', error.message);
      await p.goto('https://ui.chaicode.com/auth/signup');
    }
    
    await p.waitForLoadState('domcontentloaded');
    await p.waitForTimeout(waitMs);
    await p.getByRole('textbox', { name: /email/i }).waitFor({ state: 'visible', timeout: 15000 });
    await p.waitForTimeout(waitMs);
    return 'Signup page is interactive';
  },
});

const fillSignupFormSlow = tool({
  name: 'fillSignupFormSlow',
  description: 'Fill First Name, Last Name, Email, Password, Confirm Password with visible slow typing, then submit',
  parameters: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    password: z.string(),
    perCharDelay: z.number().nullable().optional(),
    betweenFieldsMs: z.number().nullable().optional(),
  }),
  async execute({ firstName, lastName, email, password, perCharDelay = 100, betweenFieldsMs = 400 }) {
    const p = await ensurePage();

    const firstNameInput = p.getByLabel(/first\s*name/i);
    const lastNameInput  = p.getByLabel(/last\s*name/i);
    const emailInput     = p.getByRole('textbox', { name: /email/i });
    const passwordInput  = p.getByLabel(/^password$/i);
    const confirmInput   = p.getByLabel(/confirm\s*password/i);
    const submitButton   = p.getByRole('button', { name: /create account|sign up|register/i });

    await firstNameInput.scrollIntoViewIfNeeded();
    await firstNameInput.click({ timeout: 8000 });
    await firstNameInput.pressSequentially(firstName, { delay: perCharDelay });
    await p.waitForTimeout(betweenFieldsMs);

    await lastNameInput.scrollIntoViewIfNeeded();
    await lastNameInput.click({ timeout: 8000 });
    await lastNameInput.pressSequentially(lastName, { delay: perCharDelay });
    await p.waitForTimeout(betweenFieldsMs);

    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.click({ timeout: 8000 });
    await emailInput.pressSequentially(email, { delay: perCharDelay });
    await p.waitForTimeout(betweenFieldsMs);

    await passwordInput.scrollIntoViewIfNeeded();
    await passwordInput.click({ timeout: 8000 });
    await passwordInput.pressSequentially(password, { delay: perCharDelay });
    await p.waitForTimeout(250);

    await confirmInput.scrollIntoViewIfNeeded();
    await confirmInput.click({ timeout: 8000 });
    await confirmInput.pressSequentially(password, { delay: perCharDelay });
    await p.waitForTimeout(500);

    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.hover().catch(() => {});
    await Promise.all([
      p.waitForTimeout(1500),
      submitButton.click(),
    ]);

    const emailValue = await emailInput.inputValue().catch(() => '');
    const emailLooksOk = /@/.test(emailValue);
    return `Submitted the form. Email visible=${emailLooksOk}`;
  }
});

const takeScreenshot = tool({
  name: 'takeScreenshot',
  description: 'Save a screenshot of the current page',
  parameters: z.object({ filename: z.string() }),
  async execute({ filename }) {
    const p = await ensurePage();
    await p.screenshot({ path: filename });
    return `Saved ${filename}`;
  },
});

const agent = new Agent({
  name: 'Signup Agent (Slow)',
  tools: [openBrowser, goToMainPage, navigateToSignup, fillSignupFormSlow, takeScreenshot, closeBrowser],
  instructions: `
    Open browser, navigate to main page first, then to signup, type with visible delays, submit, and take screenshots.
    Use role/label-based locators and pause briefly after navigation and between fields.
  `,
});

async function main() {
  const input = `
    1) Open browser
    2) Go to main page waitMs=1000
    3) Navigate to signup waitMs=1000
    4) TakeScreenshot filename=signup-page.png
    5) FillSignupFormSlow firstName=Alex lastName=Johnson email=alex.johnson@example.com password=MySecurePass123 perCharDelay=120 betweenFieldsMs=600
    6) TakeScreenshot filename=after-submit.png
    7) Close browser
  `;
  const res = await run(agent, input, { max_turns: 20 });
  console.log(res.finalOutput);
}

main().catch(console.error);
