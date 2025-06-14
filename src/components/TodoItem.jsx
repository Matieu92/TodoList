import React from 'react';
import useTodoStore from '../store';

const getDueDateStatus = (dueDate) => {};

const TodoItem = ({ todo }) => {
  const { toggleDone, deleteTodo } = useTodoStore(state => ({
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
    backgroundColor: todo.done ? '#e0ffe0' : 'white',
    opacity: todo.isPending ? 0.6 : 1, 
    borderLeft: todo.isPending ? '3px solid orange' : (
        dueDateStatus === 'overdue' && !todo.done ? '3px solid red' : (
        dueDateStatus === 'nearing' && !todo.done ? '3px solid orange' : '3px solid transparent'
        )
    ),
  };

  if (dueDateStatus === 'overdue' && !todo.done && !todo.isPending) {
    itemStyle.borderColor = 'red';
    itemStyle.borderWidth = '2px';
  } else if (dueDateStatus === 'nearing' && !todo.done && !todo.isPending) {
    itemStyle.borderColor = 'orange';
    itemStyle.borderWidth = '2px';
  }


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
        {todo.description && <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#555' }}>{todo.description}</p>}
        {todo.dueDate && (
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: dueDateStatus === 'overdue' && !todo.done ? 'red' : (dueDateStatus === 'nearing' && !todo.done ? 'orange' : '#777') }}>
            Termin: {formatDate(todo.dueDate)}
            {dueDateStatus === 'overdue' && !todo.done && ' (Po terminie!)'}
            {dueDateStatus === 'nearing' && !todo.done && ' (Termin się zbliża!)'}
          </p>
        )}
         {todo.isPending && <small style={{ color: 'orange', marginLeft: '10px', fontStyle: 'italic' }}>(Synchronizowanie...)</small>}
      </div>
      <button 
        onClick={() => deleteTodo(todo.id)} 
        style={{ backgroundColor: '#ffdddd', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
      >
        Usuń
      </button>
    </div>
  );
};

export default TodoItem;