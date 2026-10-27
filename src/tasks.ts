export const STORAGE_KEY = 'focusboard.tasks.v1';
export const statuses = ['To do', 'In progress', 'Done'] as const;
export const priorities = ['High', 'Medium', 'Low'] as const;
export type Status = typeof statuses[number];
export type Priority = typeof priorities[number];
export type Task = { id: string; title: string; description: string; status: Status; priority: Priority; due: string };
export type Draft = Omit<Task, 'id'>;

export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function offsetDay(days: number): string {
  const date = new Date(); date.setDate(date.getDate() + days); return localDay(date);
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDay(date) === value;
}
export function validate(draft: Draft): string | null {
  if (!draft.title.trim() || draft.title.trim().length > 80) return 'Enter a task title between 1 and 80 characters.';
  if (draft.description.length > 300) return 'Keep your description within 300 characters.';
  if (draft.due && !validDate(draft.due)) return 'Choose a valid due date.';
  return null;
}
export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Task;
  return typeof task.id === 'string' && task.id.length > 0 && typeof task.title === 'string' && typeof task.description === 'string' && typeof task.due === 'string' && statuses.includes(task.status) && priorities.includes(task.priority) && validate(task) === null;
}
export function sampleTasks(): Task[] {
  return [
    { id: 'sample-1', title: 'Polish the portfolio homepage', description: 'Give the hero section a clear story and check the mobile layout.', status: 'In progress', priority: 'High', due: offsetDay(0) },
    { id: 'sample-2', title: 'Document the AI workflow', description: 'Save prompts, review notes, and the improvements made along the way.', status: 'To do', priority: 'High', due: offsetDay(1) },
    { id: 'sample-3', title: 'Review accessibility basics', description: 'Check labels, keyboard navigation, and visible focus states.', status: 'To do', priority: 'Medium', due: offsetDay(3) },
    { id: 'sample-4', title: 'Set up the project repository', description: 'A clean README, sensible conventions, and the first meaningful commit.', status: 'Done', priority: 'Low', due: offsetDay(-1) },
    { id: 'sample-5', title: 'Explore React state patterns', description: 'Practice controlled inputs and derived state in a small feature.', status: 'Done', priority: 'Medium', due: offsetDay(-2) },
  ];
}
export function loadTasks(): { tasks: Task[]; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { tasks: sampleTasks(), warning: '' };
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every(isTask) || new Set(data.map(task => task.id)).size !== data.length) throw new Error('Invalid saved data');
    return { tasks: data, warning: '' };
  } catch { return { tasks: [], warning: 'Saved tasks could not be loaded. Your stored data has not been overwritten. You can still use this session.' }; }
}
export function filterTasks(tasks: Task[], query: string, status: string, priority: string): Task[] {
  const search = query.trim().toLowerCase();
  return tasks.filter(task => (status === 'All tasks' || task.status === status) && (priority === 'All priorities' || task.priority === priority) && `${task.title} ${task.description}`.toLowerCase().includes(search));
}
