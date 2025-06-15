import React from 'react';
import useTodoStore from '../store';

const getDueDateStatus = (dueDate) => {
  if (!dueDate) return '#9ca3af';
  const today = new Date();
  const due = new Date(dueDate);
  const diffInMs = due - today;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  if (due < today) {
    return '#7f1d1d';
  } else if (diffInDays <= 4) {
    return '#b37b1b';
  }
  return '#252525';
};

const TodoItem = ({ todo }) => {
  const { toggleDone, deleteTodo } = useTodoStore((state) => ({
    toggleDone: state.toggleDone,
    deleteTodo: state.deleteTodo,
  }));

  const dueDateStatus = getDueDateStatus(todo.dueDate);

  const itemStyle = {
    padding: '10px',
    border: '1px solid #eee',
    marginBottom: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: todo.done ? '#e0ffe0' : dueDateStatus,
    opacity: todo.isPending ? 0.6 : 1,
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  return (
    <div style={itemStyle}>
      <div>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => toggleDone(todo.id)}
          style={{ marginRight: '10px' }}
        />
        <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
          <strong>{todo.title}</strong>
        </span>
        {todo.description && (
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#555' }}>
            {todo.description}
          </p>
        )}
        {todo.dueDate && (
          <p
            style={{
              margin: '5px 0 0 0',
              fontSize: '0.8em',
              color: '#9ca3af',
            }}
            className="due-date"
          >
            Termin: {formatDate(todo.dueDate)}
          </p>
        )}
        {todo.isPending && (
          <small
            style={{
              color: 'orange',
              marginLeft: '10px',
              fontStyle: 'italic',
            }}
          >
            (Synchronizowanie...)
          </small>
        )}
      </div>
      <div style={{backgroundColor: '#5f0a1c', borderRadius: '8px'}}>
      <button
        onClick={() => deleteTodo(todo.id)}
        style={{
          backgroundColor: '#000000',
          border: '10px',
          padding: '5px 10px',
          cursor: 'pointer',
        }}
      >
        Usuń
      </button>
      </div>
    </div>
  );
};

export default TodoItem;