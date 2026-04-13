import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const csvPath = './MAPA- espaço físico.csv';

const parseCSV = () => {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  
  const rooms = [];
  let currentRoom = null;
  let isParsingSchedule = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentRoom) {
        rooms.push(currentRoom);
        currentRoom = null;
        isParsingSchedule = false;
      }
      continue;
    }

    const columns = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());

    if (columns[0] === 'horário') {
      isParsingSchedule = true;
      continue;
    }

    if (!isParsingSchedule) {
      // It's a room name line
      const fullName = columns[0];
      if (!fullName) continue;

      let block = 'Pavilhão';
      let pavilion = 'Térreo';
      
      if (fullName.includes('1º andar') || fullName.includes('1º pavimento') || fullName.includes('1º Pavimento')) {
        pavilion = '1º Pavimento';
      } else if (fullName.includes('2º andar') || fullName.includes('2º Pavimento')) {
        pavilion = '2º Pavimento';
      } else if (fullName.includes('3º andar') || fullName.includes('3º Pavimento')) {
        pavilion = '3º Pavimento';
      }

      if (fullName.includes('("B")')) block = 'Bloco B';
      else if (fullName.includes('("C")')) block = 'Bloco C';
      else if (fullName.includes('("D")')) block = 'Bloco D';
      else if (fullName.includes('DFS')) block = 'Bloco DFS';
      else if (fullName.includes('DMOR')) block = 'Bloco DMOR';
      else if (fullName.includes('DBF')) block = 'Bloco DBF';

      // Clean name: Remove info in parentheses and trailing tags
      let name = fullName.split('(')[0].split('-')[0].trim();
      if (!name) name = fullName;

      currentRoom = {
        name,
        fullName,
        block,
        pavilion,
        status: 'Fechada',
        schedule: {
          seg: {}, ter: {}, qua: {}, qui: {}, sex: {}
        }
      };
    } else {
      // Parsing schedule rows
      if (currentRoom) {
        const [time, seg, ter, qua, qui, sex] = columns;
        if (time && time.includes('-')) {
          if (seg) currentRoom.schedule.seg[time] = seg;
          if (ter) currentRoom.schedule.ter[time] = ter;
          if (qua) currentRoom.schedule.qua[time] = qua;
          if (qui) currentRoom.schedule.qui[time] = qui;
          if (sex) currentRoom.schedule.sex[time] = sex;
        }
      }
    }
  }

  if (currentRoom) rooms.push(currentRoom);
  return rooms;
};

const importData = async () => {
  console.log('--- Iniciando Importação ---');
  const rooms = parseCSV();
  console.log(`Encontradas ${rooms.length} salas para importar.`);

  const roomsCol = collection(db, 'rooms');
  
  // 1. Limpar salas atuais
  console.log('Limpando dados antigos...');
  const snapshot = await getDocs(roomsCol);
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, 'rooms', docSnapshot.id));
  }

  // 2. Adicionar novas salas
  console.log('Adicionando novas salas...');
  for (const room of rooms) {
    await addDoc(roomsCol, {
      ...room,
      createdAt: serverTimestamp()
    });
    console.log(`Sala importada: ${room.name}`);
  }

  console.log('--- Importação Concluída com Sucesso! ---');
  process.exit(0);
};

importData().catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
