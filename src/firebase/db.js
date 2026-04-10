import { db } from './config';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
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
    checklist
  });
};
