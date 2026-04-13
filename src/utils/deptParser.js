export const parseDepartmentsCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const departmentsMap = new Map();

  // Pula o cabeçalho
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^)/g) || [];
    const [cod, name] = columns.map(c => c.replace(/^"|"$/g, '').trim());
    
    if (cod && name) {
      const sigla = cod.toUpperCase();
      if (!departmentsMap.has(sigla)) {
        departmentsMap.set(sigla, {
          name: name,
          sigla: sigla,
          description: `Departamento de ${name}`
        });
      }
    }
  }

  return Array.from(departmentsMap.values());
};

