export const parseSubjectsCSV = (csvContent, departments = []) => {
  const cleanContent = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = cleanContent.split('\n');
  const subjects = [];
  
  // Detecção automática de separador (vírgula ou ponto-e-vírgula)
  const firstLine = lines[0] || '';
  const separator = firstLine.includes(';') ? ';' : ',';
  
  console.log('--- SUBJECT PARSER DEBUG ---');
  console.log('Total de linhas:', lines.length);
  console.log('Separador detectado:', `"${separator}"`);
  console.log('Primeira linha (header):', firstLine);

  const deptLookup = {};
  departments.forEach(d => {
    deptLookup[d.name.toLowerCase().trim()] = d.id;
    deptLookup[d.sigla.toLowerCase().trim()] = d.id;
  });

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split robusto para CSV (respeita aspas)
    const columns = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        columns.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    columns.push(current.trim().replace(/^"|"$/g, ''));

    const code = columns[0]?.toUpperCase();
    const name = columns[1];
    
    // Log apenas das primeiras 3 linhas para diagnóstico
    if (i < 4) {
      console.log(`Linha ${i} Colunas:`, columns);
    }

    // Regra: Código precisa ter pelo menos 6 caracteres e Nome precisa existir
    if (code && name && code.length >= 6) {
      const deptNameRaw = columns[2];
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
        code,
        name,
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

  console.log('Parsing Finalizado. Válidos:', uniqueSubjects.length);
  return uniqueSubjects;
};



