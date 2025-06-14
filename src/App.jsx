import React, { useEffect } from 'react';
import useTodoStore from './store';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Auth from './components/Auth';
import './App.css'; 

function App() {
  const setUser = useTodoStore(state => state.setUser);
  const user = useTodoStore(state => state.user);
  const subscribeToTodos = useTodoStore(state => state.subscribeToTodos);
  const clearStore = useTodoStore(state => state.clearStore);
  const globalError = useTodoStore(state => state.error);
  const isOffline = useTodoStore(state => state.isOffline);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email });
      } else {
        clearStore();
      }
    });
    return () => {
      unsubscribeAuth();
    };
  }, [setUser, clearStore]);

  return (
    <div className="container">
      {isOffline && (
        <div className="offline-banner">
          Jesteś w trybie offline. Zmiany zostaną zsynchronizowane po odzyskaniu połączenia.
        </div>
      )}
      <h1>Todo List 21219</h1>
      {globalError && <p className="error-message">Błąd aplikacji: {globalError}</p>}
      <Auth />
      {user && (
        <>
          <TodoForm />
          <TodoList />
        </>
      )}
    </div>
  );
}

export default App;