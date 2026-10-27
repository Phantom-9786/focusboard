import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compareTasks, filterTasks, loadTasks, localDay, sampleTasks, STORAGE_KEY, validDate, validate } from './tasks';

beforeEach(() => { vi.restoreAllMocks(); localStorage.clear(); });
describe('task model', () => {
  it('starts with five sample tasks only when storage is absent', () => { expect(loadTasks().tasks).toHaveLength(5); localStorage.setItem(STORAGE_KEY, '[]'); expect(loadTasks().tasks).toEqual([]); });
  it.each(['{broken', '{}', 'null', '[{"id":"x"}]'])('recovers without overwriting malformed storage %s', raw => {
    localStorage.setItem(STORAGE_KEY, raw); const result = loadTasks(); expect(result.tasks).toEqual([]); expect(result.warning).toContain('not been overwritten'); expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });
  it('rejects duplicate task identifiers', () => { const task = sampleTasks()[0]; localStorage.setItem(STORAGE_KEY, JSON.stringify([task, task])); expect(loadTasks().warning).not.toBe(''); });
  it('restores validated tasks', () => { const tasks = sampleTasks(); localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); expect(loadTasks().tasks).toEqual(tasks); });
  it('handles blocked storage reads', () => { vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); }); expect(loadTasks().warning).not.toBe(''); });
  it.each(['2026-02-30', '2026-13-01', 'not-a-date'])('rejects invalid calendar date %s', date => expect(validDate(date)).toBe(false));
  it('accepts leap days and uses local calendar values', () => { expect(validDate('2024-02-29')).toBe(true); expect(validDate('2026-02-29')).toBe(false); expect(localDay(new Date(2026, 9, 27, 1))).toBe('2026-10-27'); });
  it('rejects blank titles and oversized descriptions', () => { const draft = sampleTasks()[0]; expect(validate({ ...draft, title: '   ' })).not.toBeNull(); expect(validate({ ...draft, description: 'a'.repeat(301) })).not.toBeNull(); });
  it('combines case-insensitive trimmed search and both filters', () => { const tasks = sampleTasks(); expect(filterTasks(tasks, '  PORTFOLIO ', 'In progress', 'High')).toHaveLength(1); expect(filterTasks(tasks, 'portfolio', 'Done', 'High')).toHaveLength(0); });
  it.each(['Due date', 'Priority'])('keeps unfinished tasks ahead of done tasks when sorting by %s', sort => {
    const tasks = sampleTasks().sort((a, b) => compareTasks(a, b, sort));
    expect(tasks.slice(0, 3).every(task => task.status !== 'Done')).toBe(true);
    expect(tasks.slice(3).every(task => task.status === 'Done')).toBe(true);
  });
  it('places undated tasks after dated tasks within the same completion group', () => {
    const task = sampleTasks()[0]; expect(compareTasks({ ...task, due: '' }, task, 'Due date')).toBeGreaterThan(0);
  });
});
