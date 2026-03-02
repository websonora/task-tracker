import { useState, useRef, useEffect } from 'react'
import styles from './App.module.css'

const FILTERS = ['All', 'Active', 'Completed']

const PRIORITIES = [
  { label: 'Low', color: '#34d399' },
  { label: 'Medium', color: '#fbbf24' },
  { label: 'High', color: '#f87171' },
]

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const editRef = useRef(null)

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editing])

  const priority = PRIORITIES.find(p => p.label === task.priority) || PRIORITIES[0]

  const handleEditSave = () => {
    if (editText.trim()) {
      onEdit(task.id, editText.trim())
    }
    setEditing(false)
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave()
    if (e.key === 'Escape') { setEditText(task.text); setEditing(false) }
  }

  return (
    <div
      className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
      style={{ '--priority-color': priority.color }}
    >
      <div className={styles.taskLeft}>
        <button
          className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
          onClick={() => onToggle(task.id)}
          aria-label="Toggle task"
        >
          {task.completed && (
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className={styles.taskBody}>
          {editing ? (
            <input
              ref={editRef}
              className={styles.editInput}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
            />
          ) : (
            <span className={styles.taskText} onDoubleClick={() => !task.completed && setEditing(true)}>
              {task.text}
            </span>
          )}
          <div className={styles.taskMeta}>
            <span className={styles.priorityBadge} style={{ color: priority.color, background: `${priority.color}18` }}>
              {priority.label}
            </span>
            <span className={styles.taskDate}>{task.date}</span>
          </div>
        </div>
      </div>

      <div className={styles.taskActions}>
        {!task.completed && (
          <button
            className={styles.iconBtn}
            onClick={() => setEditing(true)}
            aria-label="Edit task"
            title="Edit"
          >
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-9 9A2 2 0 016 16H4v-2a2 2 0 01.586-1.414l9-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {!confirming ? (
          <button
            className={`${styles.iconBtn} ${styles.deleteBtn}`}
            onClick={() => setConfirming(true)}
            aria-label="Delete task"
            title="Delete"
          >
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4V3a1 1 0 011-1h6a1 1 0 011 1v1m3 0H3m2 0l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div className={styles.confirmRow}>
            <button className={styles.confirmYes} onClick={() => onDelete(task.id)}>Yes</button>
            <button className={styles.confirmNo} onClick={() => setConfirming(false)}>No</button>
          </div>
        )}
      </div>
    </div>
  )
}

function AddTaskModal({ onAdd, onClose }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('Medium')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text.trim(), priority)
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>New Task</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className={styles.formLabel}>Task description</label>
          <input
            ref={inputRef}
            className={styles.formInput}
            placeholder="What needs to be done?"
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={120}
          />
          <label className={styles.formLabel}>Priority</label>
          <div className={styles.priorityGroup}>
            {PRIORITIES.map(p => (
              <button
                key={p.label}
                type="button"
                className={`${styles.priorityOption} ${priority === p.label ? styles.prioritySelected : ''}`}
                style={{ '--p-color': p.color }}
                onClick={() => setPriority(p.label)}
              >
                <span className={styles.priorityDot} style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>
          <button type="submit" className={styles.submitBtn} disabled={!text.trim()}>
            Add Task
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useState([
    { id: generateId(), text: 'Review design mockups', priority: 'High', completed: false, date: 'Mar 2' },
    { id: generateId(), text: 'Set up project repository', priority: 'Medium', completed: true, date: 'Mar 1' },
    { id: generateId(), text: 'Write unit tests for auth module', priority: 'Low', completed: false, date: 'Mar 2' },
  ])
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const addTask = (text, priority) => {
    const now = new Date()
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    setTasks(prev => [{ id: generateId(), text, priority, completed: false, date }, ...prev])
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const editTask = (id, text) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t))
  }

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed))
  }

  const filteredTasks = tasks.filter(t => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Active' && !t.completed) ||
      (filter === 'Completed' && t.completed)
    const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const activeCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>✦</span>
              Task Tracker
            </h1>
            <p className={styles.subtitle}>Stay focused, get things done.</p>
          </div>
          <button
            id="add-task-btn"
            className={styles.addBtn}
            onClick={() => setShowModal(true)}
            aria-label="Add task"
          >
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{tasks.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum} style={{ color: 'var(--accent-light)' }}>{activeCount}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum} style={{ color: 'var(--success)' }}>{completedCount}</span>
            <span className={styles.statLabel}>Done</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressLabel}>{progress}% complete</span>
        </div>
      </header>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="search-input"
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
        <div className={styles.filterBar}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
              id={`filter-${f.toLowerCase()}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <main className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              {searchQuery ? '🔍' : filter === 'Completed' ? '🎉' : '✨'}
            </div>
            <p className={styles.emptyTitle}>
              {searchQuery
                ? 'No tasks match your search'
                : filter === 'Completed'
                  ? 'No completed tasks yet'
                  : 'No tasks here yet!'}
            </p>
            {!searchQuery && filter !== 'Completed' && (
              <p className={styles.emptyHint}>Click <strong>Add Task</strong> to get started.</p>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          ))
        )}
      </main>

      {/* Footer */}
      {completedCount > 0 && (
        <footer className={styles.footer}>
          <button className={styles.clearBtn} onClick={clearCompleted}>
            Clear {completedCount} completed task{completedCount !== 1 ? 's' : ''}
          </button>
        </footer>
      )}

      {/* Modal */}
      {showModal && <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} />}
    </div>
  )
}
