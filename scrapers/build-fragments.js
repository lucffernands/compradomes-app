// scrapers/build-fragments.js
import fs from 'fs';
import path from 'path';

// Caminhos ajustados
const fragmentsDir = path.join('../site', 'fragments'); // pasta com os fragments originais
const outputFile = path.join('../site', 'fragments_output.html'); // arquivo final consolidado

try {
  // Lê todos os arquivos da pasta de fragments
  const files = fs.readdirSync(fragmentsDir);

  // Filtra apenas HTML
  const htmlFiles = files.filter(file => file.endsWith('.html'));

  let combinedHtml = '';

  htmlFiles.forEach(file => {
    const filePath = path.join(fragmentsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    combinedHtml += `\n<!-- Fragmento: ${file} -->\n${content}\n`;
  });

  // Escreve o arquivo combinado
  fs.writeFileSync(outputFile, combinedHtml, 'utf-8');

  console.log(`✅ Fragmentos combinados com sucesso em: ${outputFile}`);
} catch (err) {
  console.error('❌ Erro ao gerar os fragments:', err);
  process.exit(1);
}
