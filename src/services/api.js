import {
  auth,
  db,
  isFirebaseConfigured
} from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';

export { isFirebaseConfigured };

// ==========================================
// LOCAL STORAGE ADAPTER (Demo / Offline Mode)
// ==========================================
const STORAGE_AUTH_KEY = 'todo_demo_user';
const STORAGE_TODOS_KEY = 'todo_demo_todos';

const todoListeners = new Set();
const authListeners = new Set();

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_TODOS_KEY);
    if (!raw) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      // Seed with initial example tasks with priorities and due dates
      const initial = [
        {
          id: 'demo_1',
          text: 'Welcome to Todo App! 🚀',
          finished: true,
          priority: 1,
          dueDate: today,
          tag: 'LIFE',
          uid: 'demo-user-id',
          createdAt: Date.now() - 60000
        },
        {
          id: 'demo_2',
          text: 'Try creating a new task above ✍️',
          finished: false,
          priority: 2,
          dueDate: today,
          tag: 'DEV',
          uid: 'demo-user-id',
          createdAt: Date.now() - 30000
        },
        {
          id: 'demo_3',
          text: 'Toggle checkbox to mark as complete ☑️',
          finished: false,
          priority: 3,
          dueDate: tomorrow,
          tag: 'WORK',
          uid: 'demo-user-id',
          createdAt: Date.now()
        }
      ];
      localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return parsed.map(t => ({
      ...t,
      priority: t.priority || 2,
      dueDate: t.dueDate || null,
      tag: t.tag || null
    }));
  } catch {
    return [];
  }
}

function notifyTodoListeners() {
  const todos = getStoredTodos();
  todoListeners.forEach((listener) => {
    try {
      const userTodos = todos.filter(t => !listener.uid || t.uid === listener.uid || t.uid === 'demo-user-id');
      listener.callback(userTodos);
    } catch (e) {
      console.error(e);
    }
  });
}

function notifyAuthListeners(user) {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.error(e);
    }
  });
}

// ==========================================
// UNIFIED AUTH API
// ==========================================

export function onAuthChange(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  }

  // Demo mode
  authListeners.add(callback);
  const currentUser = getStoredUser();
  setTimeout(() => callback(currentUser), 50);

  return () => {
    authListeners.delete(callback);
  };
}

export async function signIn(email, password) {
  if (isFirebaseConfigured && auth) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  // Demo mode
  const user = {
    uid: 'demo-user-id',
    email: email.trim() || 'demo@todoapp.local'
  };
  localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
  notifyAuthListeners(user);
  return { user };
}

export async function signUp(email, password) {
  if (isFirebaseConfigured && auth) {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  // Demo mode
  const user = {
    uid: 'demo-user-id',
    email: email.trim() || 'demo@todoapp.local'
  };
  localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
  notifyAuthListeners(user);
  return { user };
}

export async function signOutUser() {
  if (isFirebaseConfigured && auth) {
    return await signOut(auth);
  }

  // Demo mode
  localStorage.removeItem(STORAGE_AUTH_KEY);
  notifyAuthListeners(null);
}

// ==========================================
// UNIFIED TODOS API
// ==========================================

export function subscribeTodos(userId, callback) {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, "todos"),
      where("uid", "==", userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          priority: 2,
          dueDate: null,
          tag: null,
          ...doc.data()
        }));
        callback(data);
      },
      (error) => {
        console.error("Firestore todos subscription error:", error);
      }
    );
  }

  // Demo mode
  const listener = { uid: userId, callback };
  todoListeners.add(listener);

  const currentTodos = getStoredTodos().filter(
    t => !userId || t.uid === userId || t.uid === 'demo-user-id'
  );
  setTimeout(() => callback(currentTodos), 50);

  return () => {
    todoListeners.delete(listener);
  };
}

export async function createTodo(text, userId, priority = 2, dueDate = null, tag = null) {
  const numericPriority = Number(priority) || 2;
  if (isFirebaseConfigured && db) {
    return await addDoc(collection(db, "todos"), {
      text,
      finished: false,
      priority: numericPriority,
      dueDate: dueDate || null,
      tag: tag || null,
      uid: userId,
      createdAt: Date.now()
    });
  }

  // Demo mode
  const todos = getStoredTodos();
  const newTodo = {
    id: 'demo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    text,
    finished: false,
    priority: numericPriority,
    dueDate: dueDate || null,
    tag: tag || null,
    uid: userId || 'demo-user-id',
    createdAt: Date.now()
  };
  todos.unshift(newTodo);
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  notifyTodoListeners();
  return newTodo;
}

export async function updateTodoStatus(id, isFinished) {
  if (isFirebaseConfigured && db) {
    return await updateDoc(doc(db, "todos", id), {
      finished: isFinished
    });
  }

  // Demo mode
  const todos = getStoredTodos().map(t =>
    t.id === id ? { ...t, finished: isFinished } : t
  );
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  notifyTodoListeners();
}

export async function updateTodoText(id, newText) {
  if (isFirebaseConfigured && db) {
    return await updateDoc(doc(db, "todos", id), {
      text: newText
    });
  }

  // Demo mode
  const todos = getStoredTodos().map(t =>
    t.id === id ? { ...t, text: newText } : t
  );
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  notifyTodoListeners();
}

export async function updateTodoPriority(id, newPriority) {
  const numericPriority = Number(newPriority) || 2;
  if (isFirebaseConfigured && db) {
    return await updateDoc(doc(db, "todos", id), {
      priority: numericPriority
    });
  }

  // Demo mode
  const todos = getStoredTodos().map(t =>
    t.id === id ? { ...t, priority: numericPriority } : t
  );
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  notifyTodoListeners();
}

export async function updateTodo(id, updates) {
  if (isFirebaseConfigured && db) {
    return await updateDoc(doc(db, "todos", id), updates);
  }

  // Demo mode
  const todos = getStoredTodos().map(t =>
    t.id === id ? { ...t, ...updates } : t
  );
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  notifyTodoListeners();
}

export async function removeTodo(id) {
  if (isFirebaseConfigured && db) {
    return await deleteDoc(doc(db, "todos", id));
  }

  // Demo mode
  const todos = getStoredTodos().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  notifyTodoListeners();
}

export async function clearCompletedTodos(userId) {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, "todos"),
      where("uid", "==", userId),
      where("finished", "==", true)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((docItem) => {
      batch.delete(docItem.ref);
    });
    return await batch.commit();
  }

  // Demo mode
  const todos = getStoredTodos().filter((t) => {
    const isThisUser = !userId || t.uid === userId || t.uid === 'demo-user-id';
    return !(isThisUser && t.finished);
  });
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  notifyTodoListeners();
}

export async function toggleAllTodos(userId, targetFinished) {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, "todos"),
      where("uid", "==", userId)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((docItem) => {
      batch.update(docItem.ref, { finished: targetFinished });
    });
    return await batch.commit();
  }

  // Demo mode
  const todos = getStoredTodos().map((t) => {
    const isThisUser = !userId || t.uid === userId || t.uid === 'demo-user-id';
    return isThisUser ? { ...t, finished: targetFinished } : t;
  });
  localStorage.setItem(STORAGE_TODOS_KEY, JSON.stringify(todos));
  notifyTodoListeners();
}


