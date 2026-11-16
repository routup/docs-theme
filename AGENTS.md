# @routup/docs-theme: Agent Guide

`@routup/docs-theme` is the shared VitePress theme for the routup documentation sites
(routup.dev and plugins.routup.dev). It is a single npm package; the sites consume it from npm.

## Commands

```bash
npm install    # install dependencies
npm run lint   # ESLint (@tada5hi/eslint-config), covers src/ and test/
npm run lint:fix
npm test       # Vitest (test/vitest.config.ts)
npm pack       # tarball for trying the theme in a site
```

- **Node.js**: >=22.0.0
- There is no type-check script: the package has `.vue` files and no `vue-tsc` setup.

## Rules

- **Source only, no build.** `src/` (`.vue`, `.ts`, `.css`) is published as is and compiled by the
  consuming site's Vite. `files` in `package.json` ships only `src/`; check with `npm pack --dry-run`.
- **`./config` stays plain `.mjs` with a hand-written `.d.mts`** (`src/config.mjs`, `src/config.d.mts`).
  VitePress leaves config imports from `node_modules` to Node, and Node does not strip TypeScript
  inside `node_modules`. This only fails when the package is installed from a tarball or npm, not from
  a linked checkout, so verify a change to `./config` by installing the `npm pack` output in a site.
- **Commits** follow Conventional Commits (`@tada5hi/commitlint-config`, checked by the husky
  `commit-msg` hook). release-please derives versions and the changelog from them.
- Do **not** add a `Co-Authored-By` or any other AI-attribution trailer to commit messages.
