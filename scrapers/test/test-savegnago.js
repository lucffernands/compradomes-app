// scrapers/test/test-savegnago.js
import puppeteer from 'puppeteer';

const TEST_PRODUCT = 'Bacon';

async function testSavegnago(product) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const url = `https://www.savegnago.com.br/hortolandia?gad_source=1&gad_campaignid=21901892571&gbraid=0AAAAADlBfB8Jyg8XtdJAtDzpDbXHWUwmS&gclid=EAIaIQobChMIlLq33I_CjwMVGGhIAB0SPge3EAAYAiAAEgILpPD_BwE`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Seleciona o preço pelo HTML que você passou
    const priceText = await page.$eval(
      '.savegnagoio-store-theme-15-x-priceUnit',
      el => el.textContent.trim()
    );

    console.log(`🔎 Testando Savegnago para: ${product}`);
    console.log(`✅ Preço encontrado: ${priceText}`);
  } catch (err) {
    console.error('❌ Erro ao buscar preço Savegnago:', err);
  } finally {
    await browser.close();
    console.log('✅ Teste finalizado');
  }
}

// Executa o teste
testSavegnago(TEST_PRODUCT);
