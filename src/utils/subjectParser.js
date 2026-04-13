export const parseSubjectsCSV = (csvContent, departments = []) => {
  // Remove BOM se existir e normaliza quebras de linha
  const cleanContent = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = cleanContent.split('\n');
  const subjects = [];
  
  console.log('Iniciando parsing de CSV. Total de linhas:', lines.length);

  // Mapa para busca rápida de departamento
  const deptLookup = {};
  departments.forEach(d => {
    deptLookup[d.name.toLowerCase().trim()] = d.id;
    deptLookup[d.sigla.toLowerCase().trim()] = d.id;
  });

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split mais resiliente para CSV
    const columns = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        columns.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    columns.push(current.trim().replace(/^"|"$/g, ''));

    const code = columns[0];
    const name = columns[1];
    const deptNameRaw = columns[2];

    // Debug para a primeira linha de dados
    if (i === 1) console.log('DEBUG Primeira Linha:', { code, name, deptNameRaw, columnsCount: columns.length });

    if (code && name && code.length >= 6) {
      // Tenta encontrar o departamento
      let deptId = null;
      if (deptNameRaw) {
        const cleanDeptName = deptNameRaw.replace('DEPT.', '').trim().toLowerCase();
        deptId = deptLookup[cleanDeptName] || deptLookup[deptNameRaw.toLowerCase()] || null;
      }
      
      if (!deptId) {
        const sigla = code.substring(0, 3).toLowerCase();
        deptId = deptLookup[sigla] || null;
      }

      subjects.push({
        code: code.toUpperCase(),
        name: name,
        departmentId: deptId,
        credits: columns[3] || '',
        capacity: columns[5] || '',
        fullLine: line
      });
    }
  }

  // Remove duplicatas
  const uniqueSubjects = [];
  const seenCodes = new Set();
  
  subjects.forEach(s => {
    if (!seenCodes.has(s.code)) {
      seenCodes.add(s.code);
      uniqueSubjects.push(s);
    }
  });

  console.log('Parsing concluído. Válidos:', uniqueSubjects.length);
  return uniqueSubjects;
};


