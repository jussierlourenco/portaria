/**
 * Utilitários para processar a escala de aulas das salas
 */

// Mapeamento de dias da semana (JS getDay() retorna 0 para Domingo)
const DAY_MAP = {
  1: 'seg',
  2: 'ter',
  3: 'qua',
  4: 'qui',
  5: 'sex'
};

/**
 * Converte string "HH:MM-HH:MM" para objetos de data comparáveis
 */
const parseTimeSlot = (slot) => {
  const [start, end] = slot.split('-').map(t => {
    const [h, m] = t.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date;
  });
  return { start, end };
};

/**
 * Retorna o status de aula de uma sala para o momento atual
 * @param {Object} schedule - Objeto de escala da sala { seg: { "7:00-7:50": "COD", ... }, ... }
 * @returns {Object} { isOccupied: boolean, currentClass: string, nextClass: string, nextStartTime: string }
 */
export const getRoomScheduleStatus = (schedule) => {
  if (!schedule) return { isOccupied: false, currentClass: null, nextClass: null, nextStartTime: null };

  const now = new Date();
  const dayIndex = now.getDay();
  const dayKey = DAY_MAP[dayIndex];

  if (!dayKey) {
    return { isOccupied: false, currentClass: null, nextClass: null, nextStartTime: null };
  }

  const daySchedule = schedule[dayKey] || {};
  let currentClass = null;
  let nextClass = null;
  let nextStartTime = null;

  // Ordenar slots por horário
  const slots = Object.keys(daySchedule).sort((a, b) => {
    const [hA] = a.split(':').map(Number);
    const [hB] = b.split(':').map(Number);
    return hA - hB;
  });

  for (const slot of slots) {
    const { start, end } = parseTimeSlot(slot);
    const className = daySchedule[slot];

    if (now >= start && now <= end) {
      if (className && className.trim() !== '') {
        currentClass = className;
      }
    } else if (now < start && !nextClass && className && className.trim() !== '') {
      nextClass = className;
      nextStartTime = slot.split('-')[0];
    }
  }

  return {
    isOccupied: !!currentClass,
    currentClass,
    nextClass,
    nextStartTime
  };
};
