import { describe, expect, it } from 'vitest';
import { footerVisibleHeight } from '../../src/footer-offset';

describe('footerVisibleHeight', () => {
    it('should be 0 while the footer is below the viewport', () => {
        expect(footerVisibleHeight(800, 1200)).toBe(0);
        expect(footerVisibleHeight(800, 800)).toBe(0);
    });

    it('should be the part of the footer inside the viewport', () => {
        expect(footerVisibleHeight(800, 500)).toBe(300);
    });

    it('should not exceed the viewport height', () => {
        expect(footerVisibleHeight(800, -100)).toBe(800);
    });

    it('should be 0 for values that are not finite', () => {
        expect(footerVisibleHeight(NaN, 100)).toBe(0);
        expect(footerVisibleHeight(800, Infinity)).toBe(0);
    });
});
