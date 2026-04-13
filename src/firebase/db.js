import { db } from './config';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

// Listen for updates on all rooms
export const subscribeToRooms = (callback) => {
  const q = query(collection(db, 'rooms'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(rooms);
  });
};

// --- Departments ---

export const subscribeToDepartments = (callback) => {
  const q = query(collection(db, 'departments'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const depts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(depts);
  });
};

export const addDepartment = async (deptData) => {
  await addDoc(collection(db, 'departments'), {
    ...deptData,
    createdAt: serverTimestamp()
  });
};

export const updateDepartment = async (deptId, deptData) => {
  const deptRef = doc(db, 'departments', deptId);
  await updateDoc(deptRef, {
    ...deptData,
    updatedAt: serverTimestamp()
  });
};

export const deleteDepartment = async (deptId) => {
  const deptRef = doc(db, 'departments', deptId);
  await deleteDoc(deptRef);
};

export const syncDepartments = async (deptsData) => {
  const deptsCol = collection(db, 'departments');
  const snapshot = await getDocs(deptsCol);
  const deletePromises = snapshot.docs.map(docSnapshot => deleteDoc(doc(db, 'departments', docSnapshot.id)));
  await Promise.all(deletePromises);

  const addPromises = deptsData.map(dept => addDoc(deptsCol, {
    ...dept,
    createdAt: serverTimestamp()
  }));
  await Promise.all(addPromises);
};

// --- Subjects (Disciplinas) ---

export const subscribeToSubjects = (callback) => {
  const q = query(collection(db, 'subjects'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(subjects);
  });
};

export const addSubject = async (subjectData) => {
  await addDoc(collection(db, 'subjects'), {
    ...subjectData,
    createdAt: serverTimestamp()
  });
};

export const updateSubject = async (subjectId, subjectData) => {
  const subjectRef = doc(db, 'subjects', subjectId);
  await updateDoc(subjectRef, {
    ...subjectData,
    updatedAt: serverTimestamp()
  });
};

export const deleteSubject = async (subjectId) => {
  const subjectRef = doc(db, 'subjects', subjectId);
  await deleteDoc(subjectRef);
};

export const syncSubjects = async (subjectsData) => {
  const subjectsCol = collection(db, 'subjects');
  const snapshot = await getDocs(subjectsCol);
  const deletePromises = snapshot.docs.map(docSnapshot => deleteDoc(doc(db, 'subjects', docSnapshot.id)));
  await Promise.all(deletePromises);

  const addPromises = subjectsData.map(subject => addDoc(subjectsCol, {
    ...subject,
    createdAt: serverTimestamp()
  }));
  await Promise.all(addPromises);
};


// Check-in (Open Room)
export const roomCheckIn = async (roomId, userId) => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    status: 'Aberta',
    lastAction: 'check-in',
    lastActionBy: userId,
    lastActionAt: serverTimestamp()
  });

  // Log activity
  await addDoc(collection(db, 'logs'), {
    roomId,
    type: 'check-in',
    userId,
    timestamp: serverTimestamp()
  });
};

// Check-out (Close Room + Checklist)
export const roomCheckOut = async (roomId, userId, checklist) => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    status: 'Fechada',
    lastAction: 'check-out',
    lastActionBy: userId,
    lastActionAt: serverTimestamp(),
    checklist: checklist // { ac: bool, lights: bool, windows: bool }
  });

  // Log activity
  await addDoc(collection(db, 'logs'), {
    roomId,
    type: 'check-out',
    userId,
    timestamp: serverTimestamp(),
  });
};

// --- Room Management (CRUD) ---

// Sincronizar todas as salas (Limpa e Re-adiciona)
export const syncRooms = async (roomsData) => {
  const roomsCol = collection(db, 'rooms');
  
  // 1. Buscar todas as salas atuais para deletar
  const snapshot = await getDocs(roomsCol);
  const deletePromises = snapshot.docs.map(docSnapshot => deleteDoc(doc(db, 'rooms', docSnapshot.id)));
  await Promise.all(deletePromises);

  // 2. Adicionar novas salas
  const addPromises = roomsData.map(room => addDoc(roomsCol, {
    ...room,
    createdAt: serverTimestamp()
  }));
  await Promise.all(addPromises);
};

// Add a new room
export const addRoom = async (roomData) => {
  await addDoc(collection(db, 'rooms'), {
    ...roomData,
    status: 'Fechada', // Default state
    createdAt: serverTimestamp()
  });
};

// Update existing room
export const updateRoom = async (roomId, roomData) => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    ...roomData,
    updatedAt: serverTimestamp()
  });
};

// Delete a room
export const deleteRoom = async (roomId) => {
  const roomRef = doc(db, 'rooms', roomId);
  await deleteDoc(roomRef);
};
