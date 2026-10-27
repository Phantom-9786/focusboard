import { useEffect, useRef, useState, type FormEvent } from 'react';
import { compareTasks, filterTasks, loadTasks, localDay, priorities, statuses, STORAGE_KEY, validate, type Draft, type Task } from './tasks';
import './styles.css';

const emptyDraft = (): Draft => ({ title: '', description: '', status: 'To do', priority: 'Medium', due: '' });
function TaskEditor({ task, onSave, onClose }: { task: Task | null; onSave: (draft: Draft) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(task ? { ...task } : emptyDraft());
  const [error, setError] = useState('');
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  function submit(event: FormEvent) {
    event.preventDefault(); const problem = validate(draft);
    if (problem) { setError(problem); titleRef.current?.focus(); return; }
    onSave({ ...draft, title: draft.title.trim(), description: draft.description.trim() });
  }
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="editor-title">
    <form onSubmit={submit} noValidate><div className="modal-heading"><div><p className="eyebrow">A LITTLE MORE CLARITY</p><h2 id="editor-title">{task ? 'Edit your task' : 'Make your next move.'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close task editor">×</button></div>
      <label htmlFor="task-title">Task title <span>Required</span></label><input ref={titleRef} id="task-title" autoFocus maxLength={80} placeholder="What would you like to work on?" value={draft.title} aria-invalid={!!error} aria-describedby={error ? 'form-error' : undefined} onChange={e => { setError(''); setDraft({ ...draft, title: e.target.value }); }}/>
      <label htmlFor="description">A little context <span>Optional</span></label><textarea id="description" maxLength={300} rows={3} placeholder="A few details to help future you…" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}/>
      <div className="form-columns"><div><label htmlFor="task-status">Status</label><select id="task-status" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Draft['status'] })}>{statuses.map(status => <option key={status}>{status}</option>)}</select></div><div><label htmlFor="task-priority">Priority</label><select id="task-priority" value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as Draft['priority'] })}>{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></div></div>
      <label htmlFor="due">Due date <span>Optional</span></label><input id="due" type="date" value={draft.due} onChange={e => setDraft({ ...draft, due: e.target.value })}/>
      {error && <p id="form-error" role="alert" className="error">{error}</p>}<div className="modal-actions"><button className="secondary" type="button" onClick={onClose}>Cancel</button><button className="primary" type="submit">{task ? 'Save changes' : 'Create task'} <span aria-hidden="true">↗</span></button></div>
    </form></dialog>;
}
function dateLabel(due: string): string {
  if (!due) return 'No due date';
  if (due === localDay()) return 'Today';
  return new Date(`${due}T12:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

export default function App() {
  const [initial] = useState(loadTasks);
  const [tasks, setTasks] = useState(initial.tasks);
  const [warning, setWarning] = useState(initial.warning);
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState('All tasks');
  const [priority, setPriority] = useState('All priorities');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Due date');
  const [editor, setEditor] = useState<{ task: Task | null } | null>(null);
  const [deleted, setDeleted] = useState<{ task: Task; index: number } | null>(null);
  const newButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const complete = tasks.filter(task => task.status === 'Done').length;
  const progress = tasks.length ? Math.round(complete / tasks.length * 100) : 0;
  const visible = filterTasks(tasks, query, status, priority).sort((a, b) => compareTasks(a, b, sort));
  function commit(next: Task[], message: string) {
    setTasks(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setWarning(''); setNotice(message); }
    catch { setWarning('Browser storage is unavailable. Your changes are kept for this session only.'); setNotice(`${message} Session only.`); }
  }
  function openEditor(task: Task | null) { returnFocus.current = document.activeElement as HTMLElement; setEditor({ task }); }
  function closeEditor() { setEditor(null); requestAnimationFrame(() => { if (returnFocus.current?.isConnected) returnFocus.current.focus(); else newButton.current?.focus(); }); }
  function save(draft: Draft) {
    const current = editor?.task;
    commit(current ? tasks.map(task => task.id === current.id ? { ...draft, id: current.id } : task) : [...tasks, { ...draft, id: crypto.randomUUID() }], current ? 'Task updated.' : 'Task created.');
    closeEditor();
  }
  function remove(task: Task) { setDeleted({ task, index: tasks.indexOf(task) }); commit(tasks.filter(item => item.id !== task.id), 'Task removed. You can undo this action.'); }
  function undo() { if (!deleted) return; const next = [...tasks]; next.splice(Math.min(deleted.index, next.length), 0, deleted.task); commit(next, 'Task restored.'); setDeleted(null); }
  return <div className="app-shell"><a className="skip-link" href="#main">Skip to tasks</a>
    <aside className="sidebar"><a className="brand" href="#main"><span className="brand-mark" aria-hidden="true">✳</span>focusboard<span className="brand-dot">.</span></a><div className="workspace-label">YOUR WORKSPACE</div><nav aria-label="Workspace"><button className="nav-active" onClick={() => { setStatus('All tasks'); setQuery(''); setPriority('All priorities'); }}><span aria-hidden="true">▦</span> My workspace <span className="nav-count">{tasks.length}</span></button></nav><div className="sidebar-card"><div className="orbit" aria-hidden="true">↗</div><h2>Small steps.<br/>Real progress.</h2><p>You don't have to do it all.<br/>Just the next right thing.</p></div><div className="sidebar-bottom"><span className="avatar">Y</span><div><strong>Your personal space</strong><small>No account needed</small></div><span className="local-dot" title="Browser-local workspace"/></div></aside>
    <main id="main"><header className="topbar"><div>Workspace <span>/</span> <strong>Overview</strong></div><span className="local-badge"><span/>Browser-local demo</span></header><div className="content">
      <div className="heading-row"><div><p className="eyebrow">LESS NOISE. MORE FOCUS.</p><h1>Make room for good work<span>.</span></h1><p className="subtitle">A clear place for your tasks, ideas, and next little wins.</p></div><button ref={newButton} className="primary new-task" onClick={() => openEditor(null)}><span aria-hidden="true">＋</span> New task</button></div>
      <section className="overview" aria-label="Task overview"><div className="stat"><span className="stat-icon peach" aria-hidden="true">▦</span><div><span>Total tasks</span><strong>{tasks.length.toString().padStart(2, '0')}</strong></div><small>Your bigger picture</small></div><div className="stat"><span className="stat-icon lilac" aria-hidden="true">◷</span><div><span>In progress</span><strong>{tasks.filter(task => task.status === 'In progress').length.toString().padStart(2, '0')}</strong></div><small>One step at a time</small></div><div className="stat"><span className="stat-icon mint" aria-hidden="true">✓</span><div><span>Completed</span><strong>{complete.toString().padStart(2, '0')}</strong></div><small>Every win counts</small></div><div className="progress-stat"><div><span>Your momentum</span><strong>{progress}%</strong></div><progress value={progress} max={100} aria-label="Tasks completed"/><small>{complete} of {tasks.length} tasks, one good step closer.</small></div></section>
      {warning && <p className="storage-warning" role="alert">{warning}</p>}<div className="feedback-line"><p role="status">{notice || 'A fresh browser starts with sample tasks. Make this space your own.'}</p>{deleted && <button className="text-button" onClick={undo}>Undo delete</button>}</div>
      <section className="task-section" aria-labelledby="tasks-heading"><div className="section-title"><h2 id="tasks-heading">Your tasks <span>{visible.length}</span></h2><label className="sort-label">Sort by <select aria-label="Sort tasks" value={sort} onChange={e => setSort(e.target.value)}><option>Due date</option><option>Priority</option></select></label></div>
        <div className="toolbar"><div className="tabs" role="group" aria-label="Filter tasks by status">{['All tasks', ...statuses].map(item => <button key={item} aria-pressed={status === item} onClick={() => setStatus(item)}>{item}</button>)}</div><div className="search-filter"><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search tasks" placeholder="Search your tasks…" value={query} onChange={e => setQuery(e.target.value)}/></label><select aria-label="Filter by priority" value={priority} onChange={e => setPriority(e.target.value)}><option>All priorities</option>{priorities.map(item => <option key={item}>{item}</option>)}</select></div></div>
        <div className="task-list">{visible.map(task => <article className={`task-card ${task.status === 'Done' ? 'is-done' : ''}`} key={task.id}><button className="complete-button" aria-label={`${task.status === 'Done' ? 'Reopen' : 'Complete'} ${task.title}`} onClick={() => commit(tasks.map(item => item.id === task.id ? { ...item, status: item.status === 'Done' ? 'To do' : 'Done' } : item), 'Task status updated.')}>{task.status === 'Done' ? '✓' : ''}</button><div className="task-body"><h3>{task.title}</h3><p>{task.description || 'No extra details. Just a clear next step.'}</p><div className="task-meta"><span className={`priority ${task.priority.toLowerCase()}`}><i/>{task.priority} priority</span><span className={task.due && task.due < localDay() && task.status !== 'Done' ? 'overdue' : ''}><span aria-hidden="true">◷ </span>{dateLabel(task.due)}{task.due && task.due < localDay() && task.status !== 'Done' ? ' · Overdue' : ''}</span></div></div><div className="task-right"><span className={`status-badge status-${statuses.indexOf(task.status)}`}>{task.status}</span><div className="task-actions"><button className="text-button" aria-label={`Edit ${task.title}`} onClick={() => openEditor(task)}>Edit</button><button className="text-button delete" aria-label={`Delete ${task.title}`} onClick={() => remove(task)}>Delete</button></div></div></article>)}{!visible.length && <div className="empty-state"><span aria-hidden="true">✳</span><h3>{tasks.length ? 'A little breathing room.' : 'Your next chapter starts here.'}</h3><p>{tasks.length ? 'No tasks match these filters. Try another search or clear your filters.' : 'Add your first task and take one small step forward.'}</p><button className="secondary" onClick={() => tasks.length ? (setQuery(''), setStatus('All tasks'), setPriority('All priorities')) : openEditor(null)}>{tasks.length ? 'Clear filters' : 'Create your first task'}</button></div>}</div>
      </section><footer className="page-footer"><span><span aria-hidden="true">✳</span> A little more organized. A little more you.</span><span>Local to this browser · No cloud sync</span></footer>
    </div></main>{editor && <TaskEditor task={editor.task} onSave={save} onClose={closeEditor}/>}</div>;
}
