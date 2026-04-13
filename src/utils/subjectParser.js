/**
 * Parser para extrair disciplinas do arquivo DEPTO.csv
 * O arquivo segue uma estrutura de cabeçalhos por departamento e depois linhas com COD,NOME...
 */

export const parseSubjectsCSV = (csvContent, departments = []) => {
  const lines = csvContent.split('\n');
  const subjects = [];
  
  // Mapa para busca rápida de departamento por nome ou sigla
  const deptLookup = {};
  departments.forEach(d => {
    deptLookup[d.name.toLowerCase().trim()] = d.id;
    deptLookup[d.sigla.toLowerCase().trim()] = d.id;
    // Adiciona variações comuns se necessário
    if (d.name.includes(',')) {
       const parts = d.name.split(',').map(p => p.trim().toLowerCase());
       parts.forEach(p => { deptLookup[p] = d.id; });
    }
  });

  // Pula a primeira linha (cabeçalhos)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split robusto para lidar com aspas (ex: "DEPT. BOTÂNICA, ...")
    const columns = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^)/g) || [];
    const cleanColumns = columns.map(c => c.replace(/^"|"$/g, '').trim());
    
    // Novas colunas: COD[0], DISCIPLINA[1], DEPARTAMENTO[2], CRD[3], T[4], CAP[5], HORÁRIO[6], LOCAL[7]
    const code = cleanColumns[0];
    const name = cleanColumns[1];
    const deptNameRaw = cleanColumns[2];

    if (code && name && code.match(/^[A-Z]{3}[0-9]{4}$/)) {
      // Tenta encontrar o departamento
      let deptId = null;
      if (deptNameRaw) {
        const cleanDeptName = deptNameRaw.replace('DEPT.', '').trim().toLowerCase();
        deptId = deptLookup[cleanDeptName] || deptLookup[deptNameRaw.toLowerCase()] || null;
      }
      
      // Fallback pela sigla do código
      if (!deptId) {
        const sigla = code.substring(0, 3).toLowerCase();
        deptId = deptLookup[sigla] || null;
      }

      subjects.push({
        code,
        name,
        departmentId: deptId,
        credits: cleanColumns[3] || '',
        capacity: cleanColumns[5] || '',
        fullLine: line
      });
    }
  }

  // Remove duplicatas por código
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

