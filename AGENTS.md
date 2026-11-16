# @routup/docs-theme: Agent Guide

`@routup/docs-theme` is the shared VitePress theme for the routup documentation sites
(routup.dev and plugins.routup.dev). It is a single npm package; the sites consume it from npm.

## Commands

```bash
npm install            # install dependencies
npm run build          # tsdown (tsdown.config.ts) -> dist/
npm run lint           # ESLint (@tada5hi/eslint-config), covers src/ and test/
npm run lint:fix
npm test               # Vitest (test/vitest.config.ts), runs against src/
npm run test:exports   # after a build: every `exports` target is in the packed package
npm pack               # builds (prepack), then the tarball for trying the theme in a site
```

- **Node.js**: >=22.0.0
- There is no type-check script; `vue-tsc` runs only inside the build to emit declarations.

## Rules

- **Only build output ships.** `files` is `dist/`; no `.vue` or `.ts` source is published. Every
  `exports` target must point into `dist/` (`npm run test:exports` checks the packed file list).
- **Two entries:** `src/index.ts` (theme, plus the components and helpers as named exports) and
  `src/config.ts`. `vue`, `vitepress` and `@fontsource-variable/*` stay external.
- **CSS is copied, not bundled.** `src/styles/*.css` is copied to `dist/styles/` and the theme's
  `import './styles/index.css'` stays in `dist/index.js` (CSS is external), so the site's Vite resolves
  the fontsource `@import`s. Rejected: `@tsdown/css`, which inlines `@import`s and so would copy
  the fontsource CSS into `dist` instead of leaving it to the site. A build plugin removes that CSS import from the
  declarations, where it fails with `noUncheckedSideEffectImports` (TS2882). The SFCs have no
  `<style>` blocks; adding one needs a CSS pipeline in the build.
- **`./config` must be plain JavaScript in `dist`.** VitePress leaves config imports from
  `node_modules` to Node, and Node does not strip TypeScript inside `node_modules`. It reads
  `./assets/logo.svg` relative to itself, so the build copies `src/assets/` to `dist/assets/`. This only
  fails when the package is installed from a tarball or npm, not from a linked checkout, so verify a
  change to `./config` by installing the `npm pack` output in a site.
- **Commits** follow Conventional Commits (`@tada5hi/commitlint-config`, checked by the husky
  `commit-msg` hook). release-please derives versions and the changelog from them.
- Do **not** add a `Co-Authored-By` or any other AI-attribution trailer to commit messages.
