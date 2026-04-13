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
  // Removido o orderBy temporariamente para debugar se o problema é o campo 'name' ou índice
  const subjectsCol = collection(db, 'subjects');
  return onSnapshot(subjectsCol, (snapshot) => {
    const subjectsCount = snapshot.size;
    console.log('Firestore: Coleção "subjects" retornou', subjectsCount, 'documentos');
    
    if (subjectsCount > 0) {
      console.log('Exemplo de campos do primeiro documento:', Object.keys(snapshot.docs[0].data()));
    }

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
  
  // 1. Limpar coleção atual
  const snapshot = await getDocs(subjectsCol);
  const deleteBatch = writeBatch(db);
  snapshot.docs.forEach(docSnap => deleteBatch.delete(docSnap.ref));
  await deleteBatch.commit();

  // 2. Adicionar novos dados em lotes (max 500 por lote)
  for (let i = 0; i < subjectsData.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = subjectsData.slice(i, i + 400);
    
    chunk.forEach(subject => {
      const newDocRef = doc(collection(db, 'subjects'));
      batch.set(newDocRef, {
        ...subject,
        createdAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`Lote de ${chunk.length} disciplinas gravado...`);
  }
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

// Log room inspection (QR Code)
export const logRoomInspection = async (roomId, userId) => {
  await addDoc(collection(db, 'logs'), {
    roomId,
    type: 'inspection',
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

// --- User Management ---

export const subscribeToUsers = (callback) => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(users);
  });
};

export const updateUserData = async (userId, data) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteUser = async (userId) => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};

// --- Logs & Activity ---

export const subscribeToLogs = (callback) => {
  const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(logs);
  });
};



