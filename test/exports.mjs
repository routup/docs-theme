/* eslint-disable no-console */
// Check the packed package against `exports`: every export target must be in
// the tarball, and `./config` must load in plain Node (no TypeScript).
// Run after `npm run build`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

function collectTargets(value) {
    if (typeof value === 'string') {
        return [value];
    }

    return Object.values(value).flatMap(collectTargets);
}

const [packed] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: root,
    encoding: 'utf8',
}));
const files = new Set(packed.files.map((file) => file.path));

const missing = Object.entries(pkg.exports)
    .flatMap(([key, value]) => collectTargets(value).map((target) => [key, target]))
    .filter(([, target]) => !files.has(target.replace(/^\.\//, '')));

for (const [key, target] of missing) {
    console.error(`exports["${key}"] -> ${target} is not in the packed package`);
}

const leaked = [...files].filter((file) => /\.(?:vue|ts|mts)$/.test(file) && !/\.d\.m?ts$/.test(file));

for (const file of leaked) {
    console.error(`source file in the packed package: ${file}`);
}

const config = await import(new URL('dist/config.js', root).href);

if (typeof config.defineRoutupConfig !== 'function') {
    console.error('dist/config.js does not export defineRoutupConfig');
    process.exitCode = 1;
}

if (missing.length > 0 || leaked.length > 0) {
    process.exitCode = 1;
} else if (!process.exitCode) {
    console.log(`${files.size} packed files cover all ${Object.keys(pkg.exports).length} exports.`);
}
