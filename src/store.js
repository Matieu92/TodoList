import { create } from 'zustand';
import { db, auth, serverTimestamp, Timestamp } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const useTodoStore = create((set, get) => ({
  todos: [],
  user: null,
  loading: true,
  error: null,
  unsubscribeTodos: null,

  isOffline: typeof window !== 'undefined' ? !navigator.onLine : true,

  setOfflineStatus: (isOffline) => {
    set({ isOffline });
  },


  setUser: (userData) => {
    const currentUnsubscribe = get().unsubscribeTodos;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }
    
    if (userData) {
      set({ user: userData, loading: true, todos: [], error: null, unsubscribeTodos: null });
      get().subscribeToTodos(); // Kluczowe wywołanie
    } else {
      set({ user: null, todos: [], loading: false, error: null, unsubscribeTodos: null });
    }
  },

  subscribeToTodos: () => {
    const user = get().user;

    if (!user) {
      console.warn("[subscribeToTodos] No user found, aborting subscription."); // LOG
      return;
    }

    set({ loading: true, error: null });
    const todosCollectionRef = collection(db, 'users', user.uid, 'todos');
    const q = query(todosCollectionRef, orderBy('createdAt', 'desc'));

    if (get().unsubscribeTodos) {
      get().unsubscribeTodos(); 
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {

        if (snapshot.empty) {
            console.warn("[onSnapshot] Snapshot is EMPTY. No documents found matching the query."); // Zmienione na warn dla lepszej widoczności
        }

        snapshot.docChanges().forEach((change) => {
        });

        const fetchedTodos = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : null,
            isPending: docSnapshot.metadata.hasPendingWrites 
          };
        });
        set({ todos: fetchedTodos, loading: false, error: null });
      }, 
      (err) => {
        console.error(`[onSnapshot] Error in listener for user ${user.uid}:`, err); // LOG
        console.error("[onSnapshot] Error code:", err.code);
        console.error("[onSnapshot] Error message:", err.message);
      }
    );
    set({ unsubscribeTodos: unsubscribe });
  },

  fetchTodos: async () => {
    const user = get().user;
    if (!user) {
      set({ todos: [], loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const todosCollectionRef = collection(db, 'users', user.uid, 'todos');
      const q = query(todosCollectionRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedTodos = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : null,
          isPending: docSnapshot.metadata.hasPendingWrites 
        };
      });
      set({ todos: fetchedTodos, loading: false, error: null });
    } catch (error) {
      console.error("Błąd podczas pobierania zadań z Firestore: ", error);
      set({ error: "Nie udało się pobrać zadań.", loading: false });
    }
  },

  addTodo: async (todoData) => {
    const user = get().user;

    if (!user || !user.uid) {
      console.error("[addTodo] User or user.uid is undefined. Aborting.");
      set({ error: "Musisz być zalogowany, aby dodać zadanie." });
      return;
    }

    const firestoreTodo = {
      title: todoData.title,
      description: todoData.description || "",
      done: false,
      createdAt: serverTimestamp(),
      dueDate: todoData.dueDate ? Timestamp.fromDate(new Date(todoData.dueDate)) : null,
      userId: user.uid,
    };

    try {
      const todosCollectionRef = collection(db, 'users', user.uid, 'todos');      
      const docRef = await addDoc(todosCollectionRef, firestoreTodo);
    } catch (error) {
      console.error("[addTodo] Błąd Firestore podczas próby dodania zadania:", error);
      console.error("[addTodo] Error code:", error.code);
      console.error("[addTodo] Error message:", error.message);
      set({ error: "Nie udało się zainicjować dodawania zadania. Szczegóły w konsoli." });
    }
  },

  toggleDone: async (id) => {
    const user = get().user;
    if (!user) return;

    const todo = get().todos.find(t => t.id === id);
    if (!todo) return;

    const previousDone = todo.done;

    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    }));

    try {
      const todoRef = doc(db, 'users', user.uid, 'todos', id);
      await updateDoc(todoRef, { done: !previousDone });
    } catch (error) {
      console.error('Błąd Firestore podczas zmiany statusu, cofanie zmiany:', error);
      set(state => ({
        todos: state.todos.map(t =>
          t.id === id ? { ...t, done: previousDone } : t
        )
      }));
      set({ error: "Nie udało się zaktualizować statusu zadania." });
    }
  },

  deleteTodo: async (id) => {
    const user = get().user;
    if (!user) return;

    const todoToDelete = get().todos.find(t => t.id === id);
    if (!todoToDelete) return;

    set(state => ({
      todos: state.todos.filter(t => t.id !== id)
    }));

    try {
      const todoRef = doc(db, 'users', user.uid, 'todos', id);
      await deleteDoc(todoRef);
    } catch (error) {
      console.error('Błąd Firestore podczas usuwania zadania, cofanie zmiany:', error);
      set(state => ({
        todos: [...state.todos, todoToDelete].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0))
      }));
      set({ error: "Nie udało się usunąć zadania." });
    }
  },

  clearStore: () => {
    if (get().unsubscribeTodos) {
      get().unsubscribeTodos();
    }
    set({ todos: [], user: null, loading: false, error: null, unsubscribeTodos: null });
  }
}));

if (typeof window !== 'undefined') {
  const updateOnlineStatus = () => {
    const isOnlineNow = navigator.onLine;
    useTodoStore.getState().setOfflineStatus(!isOnlineNow);
  };
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

export default useTodoStore;