import React, { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/tasks/';

// Modern Icon Components
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="M21 21l-4.35-4.35"></path>
  </svg>
);

const CancelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"></polygon>
  </svg>
);

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  // Load all tasks
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data.items);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create Task
  const addTask = async () => {
    if (taskInput.trim() === '') return;
    setIsLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: taskInput })
      });
      setTaskInput('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update Task
  const updateTask = async () => {
    if (!editing || taskInput.trim() === '') return;
    setIsLoading(true);
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editing.id, name: taskInput })
      });
      setEditing(null);
      setTaskInput('');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setIsLoading(true);
    try {
      await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle task completion
  const toggleComplete = async (task) => {
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: task.id, completed: !task.completed })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditing(task);
    setTaskInput(task.name);
  };

  const handleCancel = () => {
    setEditing(null);
    setTaskInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      editing ? updateTask() : addTask();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !task.completed) || 
      (filter === 'completed' && task.completed);
    const showTask = showCompleted || !task.completed;
    return matchesSearch && matchesFilter && showTask;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.filter(task => !task.completed).length;

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    mainWrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '4rem',
      fontWeight: '800',
      background: 'linear-gradient(45deg, #00f5ff, #ff00ff, #ffff00)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem',
      textShadow: '0 0 30px rgba(0, 245, 255, 0.3)'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#a0a0a0',
      fontWeight: '300'
    },
    topSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '2rem',
      marginBottom: '2rem'
    },
    statsPanel: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    statsTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      color: '#00f5ff'
    },
    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    statLabel: {
      color: '#a0a0a0',
      fontSize: '1rem'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700'
    },
    inputPanel: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    inputWrapper: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    input: {
      flex: 1,
      padding: '1rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    buttonPrimary: {
      padding: '1rem 2rem',
      background: 'linear-gradient(45deg, #00f5ff, #0080ff)',
      border: 'none',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(0, 245, 255, 0.3)'
    },
    buttonSecondary: {
      padding: '1rem 2rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease'
    },
    controlsWrapper: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchWrapper: {
      position: 'relative',
      flex: 1,
      minWidth: '250px'
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#a0a0a0'
    },
    select: {
      padding: '0.75rem 1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '1rem',
      cursor: 'pointer'
    },
    filterButton: {
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease'
    },
    tasksContainer: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden'
    },
    tasksHeader: {
      padding: '1.5rem 2rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#00f5ff'
    },
    tasksList: {
      padding: '1rem'
    },
    taskItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1.5rem',
      margin: '0.5rem 0',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    taskItemCompleted: {
      background: 'rgba(0, 255, 128, 0.1)',
      borderColor: 'rgba(0, 255, 128, 0.3)'
    },
    checkbox: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    checkboxCompleted: {
      background: 'linear-gradient(45deg, #00ff80, #00ccff)',
      borderColor: '#00ff80',
      boxShadow: '0 0 20px rgba(0, 255, 128, 0.5)'
    },
    taskText: {
      flex: 1,
      fontSize: '1.1rem',
      fontWeight: '500'
    },
    taskTextCompleted: {
      textDecoration: 'line-through',
      color: '#888',
      opacity: 0.7
    },
    taskActions: {
      display: 'flex',
      gap: '0.5rem',
      opacity: 0,
      transition: 'opacity 0.3s ease'
    },
    actionButton: {
      padding: '0.5rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      borderRadius: '8px',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#a0a0a0'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '24px',
      height: '24px',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      borderTop: '3px solid #00f5ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    glowEffect: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      transition: 'left 0.5s ease'
    }
  };

  // Add CSS animations and hover effects
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .task-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 245, 255, 0.2) !important;
        border-color: rgba(0, 245, 255, 0.5) !important;
      }
      
      .task-item:hover .task-actions {
        opacity: 1 !important;
      }
      
      .task-item:hover .glow-effect {
        left: 100% !important;
      }
      
      .button-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 245, 255, 0.5) !important;
      }
      
      .button-secondary:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        transform: translateY(-2px);
      }
      
      .action-button:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        transform: scale(1.1);
      }
      
      .input:focus, .search-input:focus {
        border-color: #00f5ff !important;
        box-shadow: 0 0 20px rgba(0, 245, 255, 0.3) !important;
        outline: none;
      }
      
      .filter-button:hover {
        border-color: #00f5ff !important;
        color: #00f5ff !important;
        box-shadow: 0 0 20px rgba(0, 245, 255, 0.2);
      }
      
      .stats-panel:hover, .input-panel:hover, .tasks-container:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
      }
      
      @media (max-width: 768px) {
        .top-section {
          grid-template-columns: 1fr !important;
        }
        .input-wrapper {
          flex-direction: column !important;
        }
        .controls-wrapper {
          flex-direction: column !important;
          align-items: stretch !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.mainWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>NEXUS TASKS</h1>
          <p style={styles.subtitle}>Neural productivity enhancement system</p>
        </div>

        {/* Top Section */}
        <div style={styles.topSection} className="top-section">
          {/* Stats Panel */}
          <div style={styles.statsPanel} className="stats-panel">
            <div style={styles.statsTitle}>SYSTEM STATUS</div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Tasks</span>
              <span style={{...styles.statValue, color: '#00f5ff'}}>{tasks.length}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Active Tasks</span>
              <span style={{...styles.statValue, color: '#ffff00'}}>{activeCount}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Completed</span>
              <span style={{...styles.statValue, color: '#00ff80'}}>{completedCount}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Efficiency</span>
              <span style={{...styles.statValue, color: '#ff00ff'}}>
                {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Input Panel */}
          <div style={styles.inputPanel} className="input-panel">
            <div style={styles.inputWrapper} className="input-wrapper">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={editing ? "Modify task parameters..." : "Initialize new task..."}
                style={styles.input}
                className="input"
                disabled={isLoading}
              />
              <button
                onClick={editing ? updateTask : addTask}
                disabled={isLoading || taskInput.trim() === ''}
                style={styles.buttonPrimary}
                className="button-primary"
              >
                {editing ? <CheckIcon /> : <PlusIcon />}
                {editing ? 'UPDATE' : 'DEPLOY'}
              </button>
              {editing && (
                <button
                  onClick={handleCancel}
                  style={styles.buttonSecondary}
                  className="button-secondary"
                >
                  <CancelIcon />
                  CANCEL
                </button>
              )}
            </div>

            {/* Controls */}
            <div style={styles.controlsWrapper} className="controls-wrapper">
              <div style={styles.searchWrapper}>
                <div style={styles.searchIcon}>
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search neural network..."
                  style={styles.searchInput}
                  className="search-input"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">ALL TASKS</option>
                <option value="active">ACTIVE</option>
                <option value="completed">COMPLETED</option>
              </select>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                style={{
                  ...styles.filterButton,
                  borderColor: showCompleted ? '#00ff80' : 'rgba(255, 255, 255, 0.3)',
                  color: showCompleted ? '#00ff80' : '#ffffff'
                }}
                className="filter-button"
              >
                <FilterIcon />
                {showCompleted ? 'HIDE' : 'SHOW'} COMPLETED
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Container */}
        <div style={styles.tasksContainer} className="tasks-container">
          <div style={styles.tasksHeader}>
            ACTIVE PROCESSES ({filteredTasks.length})
          </div>
          <div style={styles.tasksList}>
            {isLoading ? (
              <div style={{textAlign: 'center', padding: '3rem'}}>
                <div style={styles.loadingSpinner}></div>
                <div style={{marginTop: '1rem', color: '#00f5ff'}}>PROCESSING...</div>
              </div>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-item"
                  style={{
                    ...styles.taskItem,
                    ...(task.completed ? styles.taskItemCompleted : {})
                  }}
                >
                  <div style={styles.glowEffect} className="glow-effect"></div>
                  <div
                    onClick={() => toggleComplete(task)}
                    style={{
                      ...styles.checkbox,
                      ...(task.completed ? styles.checkboxCompleted : {})
                    }}
                  >
                    {task.completed && <CheckIcon />}
                  </div>
                  
                  <div style={styles.taskText}>
                    <div style={task.completed ? styles.taskTextCompleted : {}}>
                      {task.name}
                    </div>
                  </div>
                  
                  <div className="task-actions" style={styles.taskActions}>
                    <button
                      onClick={() => handleEdit(task)}
                      disabled={task.completed}
                      style={{
                        ...styles.actionButton,
                        opacity: task.completed ? 0.3 : 1
                      }}
                      className="action-button"
                      title="Modify"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={styles.actionButton}
                      className="action-button"
                      title="Terminate"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🤖</div>
                <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: '#00f5ff'}}>
                  {searchTerm || filter !== 'all' ? 'NO MATCHING PROCESSES' : 'SYSTEM IDLE'}
                </h3>
                <p>
                  {searchTerm || filter !== 'all' 
                    ? 'Adjust search parameters or filter criteria'
                    : 'Initialize your first task to begin operation'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.5)'}}>
          <p>⚡ ENTER to execute • ESC to abort • Stay in the flow</p>
        </div>
      </div>
    </div>
  );
}

export default App;