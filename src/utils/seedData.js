import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const seedInitialRooms = async () => {
  const rooms = [
    { name: 'Sala 101', block: 'Bloco A', pavilion: '1º Pavimento', status: 'Fechada', nextEventName: 'Cálculo I', nextEventTime: '18:00' },
    { name: 'Sala 102', block: 'Bloco A', pavilion: '1º Pavimento', status: 'Aberta', nextEventName: 'Física Geral', nextEventTime: '19:30' },
    { name: 'Sala 201', block: 'Bloco B', pavilion: '2º Pavimento', status: 'Fechada', nextEventName: 'Programação Web', nextEventTime: '18:00' },
    { name: 'Auditório', block: 'Pavilhão', pavilion: 'Térreo', status: 'Fechada', nextEventName: 'Seminário de IA', nextEventTime: '14:00' },
    { name: 'Laboratório 04', block: 'Bloco B', pavilion: '1º Pavimento', status: 'Fechada', nextEventName: 'Sistemas Operacionais', nextEventTime: '21:00' },
  ];

  for (const room of rooms) {
    await addDoc(collection(db, 'rooms'), {
      ...room,
      createdAt: serverTimestamp()
    });
  }
  
  console.log("Salas adicionadas com sucesso!");
};
