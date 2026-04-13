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
  const q = query(collection(db, 'rooms'), orderBy('nextEventTime', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(rooms);
  });
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
