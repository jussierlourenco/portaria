import fs from 'fs';

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

const buffer = fs.readFileSync('public/DISCIPLINA.csv');
// Tira a dúvida se é encoding: tentamos ler como UTF-8
const content = buffer.toString('utf8');
const result = parseSubjectsCSV(content);

console.log('--- UTF-8 Result ---');
console.log('Size:', result.length);

if (result.length === 0) {
    console.log('--- RAW 100 bytes ---');
    console.log(buffer.slice(0, 100).toString('hex'));
}
