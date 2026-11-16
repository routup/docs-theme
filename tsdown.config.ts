import Vue from 'unplugin-vue/rolldown';
import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        config: 'src/config.ts',
    },
    format: ['esm'],
    platform: 'neutral',
    dts: { tsc: { vue: true } },
    sourcemap: true,
    deps: {
        neverBundle: [
            'vue',
            /^vue\//,
            'vitepress',
            /^vitepress\//,
            /^@fontsource-variable\//,
            /^node:/,
            // The stylesheets ship as files (see `copy`); the consumer's Vite
            // resolves the theme's CSS import and the fontsource @imports in it.
            /\.css$/,
        ],
    },
    plugins: [
        Vue({ isProduction: true }),
        {
            // Declarations keep the theme's `import './styles/index.css'`, which
            // fails type checks with `noUncheckedSideEffectImports` (TS2882).
            name: 'strip-css-imports-from-dts',
            generateBundle(_options, bundle) {
                for (const output of Object.values(bundle)) {
                    if (output.type === 'chunk' && output.fileName.endsWith('.d.ts')) {
                        output.code = output.code.replace(/^import ["'][^"']+\.css["'];\n/gm, '');
                    }
                }
            },
        },
    ],
    copy: [
        { from: 'src/styles/*.css', to: 'dist/styles' },
        { from: 'src/assets/*', to: 'dist/assets' },
    ],
});
