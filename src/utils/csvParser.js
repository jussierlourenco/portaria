/**
 * Utilitário para transformar o CSV em objetos de Sala
 */

export const parseRoomsCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const rooms = [];
  let currentRoom = null;
  let isParsingSchedule = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line is empty or just commas
    const columns = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    const hasData = columns.some(c => c !== '');

    if (!hasData) {
      if (currentRoom) {
        rooms.push(currentRoom);
        currentRoom = null;
        isParsingSchedule = false;
      }
      continue;
    }

    if (columns[0].toLowerCase() === 'horário') {
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
