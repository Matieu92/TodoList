import React from 'react';
import useTodoStore from '../store';
import TodoItem from './TodoItem';

const TodoList = () => {
  const todos = useTodoStore(state => state.todos);
  const loading = useTodoStore(state => state.loading);
  const error = useTodoStore(state => state.error);
  const user = useTodoStore(state => state.user);

  if (!user) {
    return <p>Zaloguj się, aby zobaczyć swoje zadania.</p>;
  }

  if (loading && todos.length === 0) {
    return <p>Ładowanie zadań...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Błąd: {error}</p>;
  }

  if (todos.length === 0 && !loading) {
    return <p>Brak zadań. Dodaj pierwsze!</p>;
  }

  return (
    <div>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoList;