import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
const root = tokens.slice(tokens.indexOf(':root {'), tokens.indexOf('}', tokens.indexOf(':root {')));

function token(name: string): string {
    const match = root.match(new RegExp(`--${name}:\\s*([^;]+);`));

    if (!match) {
        throw new Error(`Token --${name} is not defined in :root.`);
    }

    const value = match[1].trim();
    const reference = value.match(/^var\(--([\w-]+)\)$/);

    return reference ? token(reference[1]) : value;
}

type RGB = [number, number, number];

function hex(value: string): RGB {
    const digits = value.replace('#', '');

    return [0, 2, 4].map((index) => Number.parseInt(digits.slice(index, index + 2), 16)) as RGB;
}

function luminance(rgb: RGB) {
    const [r, g, b] = rgb.map((channel) => {
        const c = channel / 255;

        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: RGB, b: RGB) {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);

    return (light + 0.05) / (dark + 0.05);
}

/** `color-mix(in srgb, color 10%, transparent)` painted over `surface`. */
function tint(color: RGB, surface: RGB): RGB {
    return color.map((channel, index) => 0.1 * channel + 0.9 * surface[index]) as RGB;
}

const lightSurfaces = ['rt-color-bg', 'rt-color-bg-elevated', 'rt-color-bg-muted', 'rt-color-surface'];

describe('token contrast', () => {
    it.each(['get', 'post', 'put', 'patch', 'delete'])('keeps the %s badge text at 4.5:1 or more', (method) => {
        const color = hex(token(`rt-method-${method}-on-light`));

        for (const surface of lightSurfaces) {
            expect(contrast(color, tint(color, hex(token(surface))))).toBeGreaterThanOrEqual(4.5);
        }
    });

    it('keeps both heading highlight stops at 3:1 or more', () => {
        const stops = token('rt-gradient-brand-on-light').match(/var\(--[\w-]+\)/g) ?? [];

        expect(stops).toHaveLength(2);

        for (const stop of stops) {
            const color = hex(token(stop.slice(6, -1)));

            for (const surface of lightSurfaces) {
                expect(contrast(color, hex(token(surface)))).toBeGreaterThanOrEqual(3);
            }
        }
    });

    it('keeps white button text at 4.5:1 or more in every button state', () => {
        const text = hex(token('rt-color-on-primary'));

        for (const state of ['vp-button-brand-bg', 'vp-button-brand-hover-bg', 'vp-button-brand-active-bg']) {
            expect(contrast(text, hex(token(state)))).toBeGreaterThanOrEqual(4.5);
        }
    });
});
