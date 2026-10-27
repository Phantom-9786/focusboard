import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import App from './App';
import { STORAGE_KEY } from './tasks';

beforeEach(() => {
  vi.restoreAllMocks(); localStorage.clear();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
async function createTask(title: string) {
  const user = userEvent.setup(); await user.click(screen.getByRole('button', { name: /new task/i }));
  await user.type(screen.getByLabelText(/Task title/), title);
  await user.click(screen.getByRole('button', { name: /create task/i }));
}
it('creates a trimmed task, persists it and announces the result', async () => {
  render(<App />); await createTask('  Ship the demo  ');
  expect(screen.getByRole('heading', { name: 'Ship the demo' })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(6);
  expect(screen.getByRole('status')).toHaveTextContent('Task created.'); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('rejects blank task titles and keeps the editor open', async () => {
  const user = userEvent.setup(); render(<App />); await user.click(screen.getByRole('button', { name: /new task/i }));
  expect(screen.getByLabelText(/Task title/)).toHaveFocus();
  await user.click(screen.getByRole('button', { name: /create task/i }));
  expect(screen.getByRole('alert')).toHaveTextContent('task title'); expect(screen.getByLabelText(/Task title/)).toHaveFocus();
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
it('edits an existing task without duplicating it', async () => {
  const user = userEvent.setup(); render(<App />); await user.click(screen.getByRole('button', { name: 'Edit Polish the portfolio homepage' }));
  await user.clear(screen.getByLabelText(/Task title/)); await user.type(screen.getByLabelText(/Task title/), 'Review the homepage');
  await user.click(screen.getByRole('button', { name: /save changes/i }));
  expect(screen.getByRole('heading', { name: 'Review the homepage' })).toBeInTheDocument(); expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(5);
});
it('supports completion, reopening, deletion and undo', async () => {
  const user = userEvent.setup(); render(<App />);
  await user.click(screen.getByRole('button', { name: 'Complete Polish the portfolio homepage' }));
  expect(screen.getByRole('button', { name: 'Reopen Polish the portfolio homepage' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reopen Polish the portfolio homepage' }));
  await user.click(screen.getByRole('button', { name: 'Delete Polish the portfolio homepage' }));
  expect(screen.queryByRole('heading', { name: 'Polish the portfolio homepage' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Undo delete' }));
  expect(screen.getByRole('heading', { name: 'Polish the portfolio homepage' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Undo delete' })).not.toBeInTheDocument();
});
it('filters, searches and recovers from no results', async () => {
  const user = userEvent.setup(); render(<App />);
  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(screen.getAllByRole('article')).toHaveLength(2);
  await user.type(screen.getByRole('textbox', { name: 'Search tasks' }), 'no-such-task');
  expect(screen.getByRole('heading', { name: 'A little breathing room.' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear filters' })); expect(screen.getAllByRole('article')).toHaveLength(5);
});
it('preserves an intentionally empty board on load', () => {
  localStorage.setItem(STORAGE_KEY, '[]'); render(<App />); expect(screen.getByRole('heading', { name: 'Your next chapter starts here.' })).toBeInTheDocument();
});
it('keeps working and warns when saving fails', async () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); }); render(<App />); await createTask('Session task');
  expect(screen.getByRole('heading', { name: 'Session task' })).toBeInTheDocument(); expect(screen.getByRole('alert')).toHaveTextContent('session only'); expect(screen.getByRole('status')).toHaveTextContent('Session only');
});
it('cancels the editor without persisting changes and restores focus', async () => {
  const user = userEvent.setup(); render(<App />); const trigger = screen.getByRole('button', { name: /new task/i }); await user.click(trigger);
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(trigger).toHaveFocus()); expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
it('handles the native dialog cancel event', () => {
  render(<App />); fireEvent.click(screen.getByRole('button', { name: /new task/i })); fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true })); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
