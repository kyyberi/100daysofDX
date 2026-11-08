# GitHub Pages Asset Path Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all first-party links and assets resolve when the site is hosted at the repository GitHub Pages subpath.

**Architecture:** Jekyll owns the deployment subpath through `site.baseurl`. Every generated first-party `href` and `src` delegates path construction to `relative_url`, while an isolated Node test scans the authored source for accidental root-relative local paths.

**Tech Stack:** Jekyll/Liquid, Markdown/HTML, Node.js built-in test runner.

---

### Task 1: Capture the broken-path contract

**Files:**
- Create: `test/github-pages-paths.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
test('source contains no root-relative first-party href or src attributes', () => {
  assert.deepEqual(findRootRelativeLocalUrls(sourceFiles), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/github-pages-paths.test.mjs`

Expected: failure reporting existing `/assets/...` and `/about/...` references.

### Task 2: Make generated local paths repository-aware

**Files:**
- Modify: `_config.yml`
- Modify: `_includes/head.html`
- Modify: `_includes/share.html`
- Modify: `_includes/speaker.html`
- Modify: `about.html`
- Modify: `index.html`
- Modify: `testimonials.html`
- Modify: `_posts/*.md`

- [ ] **Step 1: Configure the published subpath**

```yaml
baseurl: "/100daysofDX"
```

- [ ] **Step 2: Convert same-origin root-relative attributes**

```liquid
<img src="{{ "/assets/img/example.png" | relative_url }}" alt="Example">
```

- [ ] **Step 3: Run the regression test**

Run: `node --test test/github-pages-paths.test.mjs`

Expected: one passing test.

### Task 3: Verify deployed behavior

**Files:**
- No source changes required.

- [ ] **Step 1: Confirm the branch and publish the scoped change**

Run: `git status --short --branch && git add _config.yml _includes about.html index.html testimonials.html _posts test docs && git commit -m "Fix GitHub Pages asset paths" && git push origin gh-pages`

- [ ] **Step 2: Confirm live stylesheets**

Run: `curl -sSIL https://kyyberi.github.io/100daysofDX/assets/css/main.css https://kyyberi.github.io/100daysofDX/assets/css/mod.css`

Expected: both paths return `200` with `text/css`.
