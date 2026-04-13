/**
 * Utilitário para ler os metadados das salas do novo SALAS.csv
 * Colunas: NOME,BLOCO,ANDAR,LOCALIZACAO
 */

export const parseRoomsMetadataCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const metadataMap = new Map();

  // Pula o cabeçalho
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^)/g) || [];
    const [name, block, floor, location] = columns.map(c => c.replace(/^"|"$/g, '').trim());

    if (name) {
      metadataMap.set(name.toLowerCase(), {
        name,
        block: block || 'Não Informado',
        pavilion: floor || 'Não Informado', // Usando 'pavilion' para manter compatibilidade com o schema atual
        location: location || ''
      });
    }
  }

  return metadataMap;
};
