// scrapers/test/test-savegnago.js
import puppeteer from 'puppeteer';

const PRODUCT_QUERY = process.argv[2] || 'bacon';

async function testSavegnago(productQuery) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const url = `https://www.savegnago.com.br/${productQuery}?_q=${productQuery}&map=ft`;
  console.log(`🔎 Testando Savegnago para: ${productQuery}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Seleciona todos os produtos visíveis com preço
    const products = await page.$$eval('.savegnagoio-store-theme-15-x-productCard', cards => {
      return cards.map(card => {
        const nameEl = card.querySelector('.savegnagoio-store-theme-15-x-productName');
        const priceEl = card.querySelector('.savegnagoio-store-theme-15-x-priceUnit');
        if (!nameEl || !priceEl) return null;

        const name = nameEl.textContent.trim();
        const priceText = priceEl.textContent.trim();
        const match = priceText.match(/[\d,.]+/);
        const price = match ? parseFloat(match[0].replace(',', '.')) : null;

        // tenta capturar a unidade
        let unit = 'kg';
        const lowerName = name.toLowerCase();
        if (lowerName.includes('g') && !lowerName.includes('kg')) unit = 'g';
        else if (lowerName.includes('ml')) unit = 'ml';
        else if (lowerName.includes('l') || lowerName.includes('litro')) unit = 'l';

        return { name, price, unit };
      }).filter(p => p !== null);
    });

    if (!products.length) {
      console.log('❌ Nenhum produto encontrado.');
      await browser.close();
      return;
    }

    // Mostra os 3 primeiros produtos
    const top3 = products.slice(0, 3);
    console.log('🔹 Produtos encontrados:');
    top3.forEach(p => console.log(`- ${p.name}: R$ ${p.price.toFixed(2)} / ${p.unit}`));

    // Calcula o preço/kg ou litro
    const pricesPerKg = top3.map(p => {
      if (p.unit === 'g') {
        // converter gramas para kg
        const match = p.name.match(/(\d+)\s?g/i);
        const grams = match ? parseInt(match[1], 10) : 100; // default 100g
        return { ...p, pricePerKg: p.price * (1000 / grams) };
      } else if (p.unit === 'ml') {
        const match = p.name.match(/(\d+)\s?ml/i);
        const ml = match ? parseInt(match[1], 10) : 100;
        return { ...p, pricePerKg: p.price * (1000 / ml) }; // equivalente a litro
      } else {
        return { ...p, pricePerKg: p.price }; // já é kg ou litro
      }
    });

    // Produto mais barato
    const cheapest = pricesPerKg.reduce((prev, curr) =>
      curr.pricePerKg < prev.pricePerKg ? curr : prev
    );

    console.log(`✅ Produto mais barato por kg/l: ${cheapest.name} → R$ ${cheapest.pricePerKg.toFixed(2)}`);

  } catch (err) {
    console.log('❌ Erro ao buscar preço Savegnago:', err.message);
  }

  await browser.close();
  console.log('✅ Teste finalizado');
}

// Executa
testSavegnago(PRODUCT_QUERY);
