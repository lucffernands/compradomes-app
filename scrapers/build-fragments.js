// scrapers/build-fragments.js
import fs from 'fs';
import path from 'path';

const fragmentsDir = path.resolve('fragments');
const outputDir = path.resolve('site/data');

// Cria a pasta de destino se não existir
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Lista todos os fragments
const fragments = fs.readdirSync(fragmentsDir);

fragments.forEach(file => {
  const html = fs.readFileSync(path.join(fragmentsDir, file), 'utf-8');

  // Extrai <option> ou qualquer outro conteúdo desejado
  const options = Array.from(html.matchAll(/<option.*?>(.*?)<\/option>/g)).map(m => m[1]);

  fs.writeFileSync(
    path.join(outputDir, file.replace('.html', '.json')),
    JSON.stringify(options, null, 2),
    'utf-8'
  );
});

console.log('✅ Fragments convertidos para JSON!');
