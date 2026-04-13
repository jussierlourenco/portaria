/**
 * Parser para extrair departamentos do arquivo SALAS.csv
 */

export const parseDepartmentsCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const departmentsMap = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    
    // O departamento geralmente está na segunda coluna (índice 1) em SALAS.csv
    const deptString = columns[1];
    
    if (deptString && deptString !== 'DEPTO.' && deptString !== 'LOCALIZAÇÃO DAS SALAS EXISTENTES:') {
      // Trata casos como "DBG, DMP, BEZ"
      const names = deptString.split(',').map(s => s.trim());
      
      names.forEach(name => {
        if (name && !departmentsMap.has(name)) {
          departmentsMap.set(name, {
            name: name,
            sigla: name,
            description: `Departamento de ${name}`
          });
        }
      });
    }
  }

  return Array.from(departmentsMap.values());
};
