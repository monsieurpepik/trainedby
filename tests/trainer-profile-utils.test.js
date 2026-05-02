import { esc, formatPrice, buildStats, buildTags } from '../src/components/trainer/utils.ts';

describe('esc()', () => {
  test('escapes HTML special characters', () => {
    expect(esc('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });
  test('handles null/undefined gracefully', () => {
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
  });
  test('handles normal string', () => {
    expect(esc('Sarah Al-Mansoori')).toBe('Sarah Al-Mansoori');
  });
});

describe('formatPrice()', () => {
  test('formats price with currency symbol', () => {
    expect(formatPrice({ price: 500 }, 'AED')).toBe('AED 500');
  });
  test('uses package currency as fallback', () => {
    expect(formatPrice({ price: 200, currency: 'GBP' }, '')).toBe('GBP 200');
  });
  test('returns empty string when no price', () => {
    expect(formatPrice({ price: null }, 'AED')).toBe('');
  });
});

describe('buildStats()', () => {
  test('includes rating and review count when both present', () => {
    const stats = buildStats({ avg_rating: 4.9, review_count: 47 });
    expect(stats.find(s => s.label === 'Rating')).toBeTruthy();
    expect(stats.find(s => s.label === 'Reviews')).toBeTruthy();
  });
  test('omits rating when review_count is 0', () => {
    const stats = buildStats({ avg_rating: 4.9, review_count: 0 });
    expect(stats.find(s => s.label === 'Rating')).toBeFalsy();
  });
  test('includes experience when present', () => {
    const stats = buildStats({ experience_years: 8 });
    expect(stats.find(s => s.label === 'Experience')).toBeTruthy();
  });
  test('includes goal_achievement_rate when present', () => {
    const stats = buildStats({ goal_achievement_rate: 94 });
    expect(stats.find(s => s.label === 'Goal Rate')).toBeTruthy();
  });
  test('omits null/zero fields', () => {
    const stats = buildStats({ avg_rating: null, review_count: 0, experience_years: null });
    expect(stats).toHaveLength(0);
  });
});

describe('buildTags()', () => {
  test('prepends Verified tag when trainer is verified', () => {
    const tags = buildTags(['Strength', 'Yoga'], true, []);
    expect(tags[0]).toBe('Verified');
  });
  test('caps at 4 tags', () => {
    const tags = buildTags(['A', 'B', 'C', 'D', 'E'], false, []);
    expect(tags).toHaveLength(4);
  });
  test('deduplicates tags', () => {
    const tags = buildTags(['Yoga', 'Yoga'], false, []);
    expect(tags).toHaveLength(1);
  });
});
