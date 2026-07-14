import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("the floating field stylesheet is loaded after the existing design layers", async () => {
  const layout = await source("app/layout.tsx");

  const consistencyImport = layout.indexOf('import "./site-consistency.css"');
  const floatingImport = layout.indexOf('import "./floating-fields.css"');

  assert.ok(consistencyImport >= 0);
  assert.ok(floatingImport > consistencyImport);
});

test("the Uiverse-compatible field API remains available for new forms", async () => {
  const styles = await source("app/floating-fields.css");

  assert.match(styles, /\.input-group\s*\{/);
  assert.match(styles, /\.input\s*\{/);
  assert.match(styles, /\.user-label\s*\{/);
  assert.match(styles, /#1a73e8/i);
  assert.match(styles, /#2196f3/i);
  assert.match(styles, /border-radius:\s*1rem/);
  assert.match(styles, /cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\)/);
});

test("existing app forms receive floating labels for text inputs, textareas and selects", async () => {
  const styles = await source("app/floating-fields.css");

  assert.match(styles, /label:has\(> :is\(/);
  assert.match(styles, /label\[for\] \+ :is\(/);
  assert.match(styles, /textarea/);
  assert.match(styles, /select/);
  assert.match(styles, /:focus-within/);
  assert.match(styles, /:not\(:placeholder-shown\)/);
  assert.match(styles, /aria-invalid="true"/);
});

test("non-text controls are excluded from the global text field treatment", async () => {
  const styles = await source("app/floating-fields.css");

  for (const type of ["hidden", "checkbox", "radio", "file", "submit", "button", "reset"]) {
    assert.match(styles, new RegExp(`:not\\(\\[type=\\"${type}\\"\\]\\)`));
  }
});

test("Clerk sign in and sign up use the shared floating field classes", async () => {
  const [signIn, signUp, styles] = await Promise.all([
    source("app/sign-in/[[...sign-in]]/page.tsx"),
    source("app/sign-up/[[...sign-up]]/page.tsx"),
    source("app/floating-fields.css"),
  ]);

  for (const page of [signIn, signUp]) {
    assert.match(page, /appearance=\{floatingFieldAppearance\}/);
    assert.match(page, /formFieldRow:\s*"fi-clerk-floating-field"/);
    assert.match(page, /formFieldLabel:\s*"fi-clerk-floating-label"/);
    assert.match(page, /formFieldInput:\s*"fi-clerk-floating-input"/);
  }

  assert.match(styles, /\.fi-clerk-floating-field/);
  assert.match(styles, /\.fi-clerk-floating-label/);
  assert.match(styles, /\.fi-clerk-floating-input/);
});

test("mobile fields keep a touch-safe height and avoid iOS input zoom", async () => {
  const styles = await source("app/floating-fields.css");

  assert.match(styles, /@media \(max-width:\s*700px\)/);
  assert.match(styles, /min-height:\s*54px/);
  assert.match(styles, /font-size:\s*16px/);
  assert.match(styles, /prefers-reduced-motion/);
});
