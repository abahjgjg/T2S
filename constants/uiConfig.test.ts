
import { describe, it, expect } from 'vitest';
import { UI_TIMING } from '../constants/uiConfig';

describe('UI Config', () => {
  it('should have all timing constants defined', () => {
    expect(UI_TIMING.TOAST_DURATION).toBe(4000);
    expect(UI_TIMING.TOAST_ANIMATION).toBe(300);
    expect(UI_TIMING.COPY_FEEDBACK_DURATION).toBe(2000);
    expect(UI_TIMING.DEBOUNCE_SEARCH).toBe(300);
    expect(UI_TIMING.DEBOUNCE_SAVE).toBe(5000);
    expect(UI_TIMING.LOADING_TEXT_ROTATION).toBe(3000);
    expect(UI_TIMING.PAGE_RELOAD_DELAY).toBe(1000);
    expect(UI_TIMING.RETRY_BASE_DELAY).toBe(100);
  });

  it('should have reasonable timing values', () => {
    expect(UI_TIMING.TOAST_DURATION).toBeGreaterThan(UI_TIMING.TOAST_ANIMATION);
    expect(UI_TIMING.COPY_FEEDBACK_DURATION).toBeGreaterThan(0);
    expect(UI_TIMING.DEBOUNCE_SAVE).toBeGreaterThan(UI_TIMING.DEBOUNCE_SEARCH);
  });

});
