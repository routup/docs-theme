import { readFileSync } from 'node:fs';
import type { DefaultTheme, UserConfig } from 'vitepress';
import type { RoutupThemeConfig } from './types';

const THEME_PACKAGE = '@routup/docs-theme';
const THEME_COLOR = '#0b1020';

// The build copies src/assets to dist/assets, so this path holds for both.
const LOGO_SVG = readFileSync(new URL('./assets/logo.svg', import.meta.url), 'utf8');
const LOGO_DATA_URI = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG.trim())}`;

function withEntry<T>(value: T | T[] | undefined): (T | string)[] {
    let list: T[];

    if (value === undefined) {
        list = [];
    } else if (Array.isArray(value)) {
        list = value;
    } else {
        list = [value];
    }

    return list.includes(THEME_PACKAGE as T) ? [...list] : [...list, THEME_PACKAGE];
}

/**
 * Add what every routup docs site needs to a VitePress config: the theme in
 * `vite.ssr.noExternal` and `vite.optimizeDeps.exclude`, plus `theme-color`
 * and favicon head entries unless the config sets them. Nav, sidebar and
 * titles are left to the site.
 */
export function defineRoutupConfig<
    ThemeConfig extends DefaultTheme.Config & RoutupThemeConfig = DefaultTheme.Config & RoutupThemeConfig,
>(config: UserConfig<ThemeConfig>): UserConfig<ThemeConfig> {
    const vite = config.vite ?? {};
    const ssr = vite.ssr ?? {};
    const optimizeDeps = vite.optimizeDeps ?? {};
    const head = [...(config.head ?? [])];

    const hasThemeColor = head.some(([, attrs]) => attrs?.name === 'theme-color');

    if (!hasThemeColor) {
        head.push(['meta', { name: 'theme-color', content: THEME_COLOR }]);
    }

    const hasIcon = head.some(([, attrs]) => attrs?.rel === 'icon');

    if (!hasIcon) {
        head.push(['link', {
            rel: 'icon',
            type: 'image/svg+xml',
            href: LOGO_DATA_URI,
        }]);
    }

    return {
        ...config,
        head,
        vite: {
            ...vite,
            ssr: {
                ...ssr,
                // `true` already bundles every dependency.
                noExternal: ssr.noExternal === true ? true : withEntry(ssr.noExternal),
            },
            optimizeDeps: {
                ...optimizeDeps,
                exclude: withEntry(optimizeDeps.exclude),
            },
        },
    };
}
