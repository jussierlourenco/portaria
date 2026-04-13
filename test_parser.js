const fs = require('fs');

const parseSubjectsCSV = (csvContent) => {
  const cleanContent = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = cleanContent.split('\n');
  const subjects = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

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
    
    if (code && name && code.length >= 6) {
      subjects.push({ code, name });
    }
  }
  return subjects;
};

const content = fs.readFileSync('public/DISCIPLINA.csv', 'utf8');
const result = parseSubjectsCSV(content);
console.log('Result size:', result.length);
if (result.length > 0) {
    console.log('First:', result[0]);
} else {
    console.log('Sample Line:', content.split('\n')[0]);
    console.log('Sample Line 1:', content.split('\n')[1]);
}
