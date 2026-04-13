/**
 * Parser para extrair disciplinas do arquivo DEPTO.csv
 * O arquivo segue uma estrutura de cabeçalhos por departamento e depois linhas com COD,NOME...
 */

export const parseSubjectsCSV = (csvContent, departments = []) => {
  const lines = csvContent.split('\n');
  const subjects = [];
  let currentDeptId = null;

  // Mapa para busca rápida de departamento por nome ou sigla
  const deptLookup = {};
  departments.forEach(d => {
    deptLookup[d.name.toLowerCase().trim()] = d.id;
    deptLookup[d.sigla.toLowerCase().trim()] = d.id;
  });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    
    // Identifica mudança de departamento (geralmente linhas que começam com ,DEPT. ou similar)
    // Ex: ,DEPT. ECOLOGIA,,,,,, ou ,"DEPT. BOTÂNICA, ECOLOGIA E ZOOLOGIA",,,,,,
    const potentialDeptName = columns[1];
    if (potentialDeptName && (potentialDeptName.startsWith('DEPT.') || potentialDeptName.includes('DEPARTAMENTOS'))) {
      const cleanName = potentialDeptName.replace('DEPT.', '').trim();
      
      // Tenta encontrar o ID do departamento no sistema
      // Se não encontrar exatamente, tenta por sigla (extratindo do início do código das disciplinas abaixo)
      currentDeptId = deptLookup[cleanName.toLowerCase()] || 
                     deptLookup[potentialDeptName.toLowerCase()] ||
                     null;
      continue;
    }

    // Pula cabeçalhos de coluna
    if (columns[0] === 'COD' || columns[0] === 'CENTRO' || columns[0] === 'ESPAÇO') continue;

    // Processa a disciplina
    const code = columns[0];
    let name = columns[1];

    if (code && name && code.match(/^[A-Z]{3}[0-9]{4}$/)) {
      // Limpa o nome se ele estiver no formato "CÓDIGO - NOME"
      const nameParts = name.split(' - ');
      if (nameParts.length > 1 && nameParts[0].trim() === code) {
        name = nameParts.slice(1).join(' - ').trim();
      }

      // Se ainda não temos um currentDeptId, tentamos inferir pela sigla do código (ex: DFS de DFS0108)
      let deptId = currentDeptId;
      if (!deptId) {
        const sigla = code.substring(0, 3);
        deptId = deptLookup[sigla.toLowerCase()] || null;
      }

      subjects.push({
        code,
        name,
        departmentId: deptId,
        credits: columns[2] || '',
        capacity: columns[4] || '',
        fullLine: line // Para depuração se necessário
      });
    }
  }

  // Remove duplicatas (mesmo código pode aparecer várias vezes se tiver turmas diferentes)
  const uniqueSubjects = [];
  const seenCodes = new Set();
  
  subjects.forEach(s => {
    if (!seenCodes.has(s.code)) {
      seenCodes.add(s.code);
      uniqueSubjects.push(s);
    }
  });

  return uniqueSubjects;
};
