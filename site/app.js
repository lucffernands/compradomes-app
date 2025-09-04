// site/app.js

// Função para buscar JSON
async function fetchJSON(path) {
  const res = await fetch(path);
  return res.json();
}

// Renderiza produtos (prices.json)
async function renderProducts() {
  const productsData = await fetchJSON('../data/prices.json');

  const container = document.getElementById('products-container');
  container.innerHTML = '';

  productsData.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <strong>${product.name}</strong><br>
      ${product.prices.map(p => `${p.store}: R$ ${p.price}`).join('<br>')}
    `;
    container.appendChild(div);
  });
}

// Renderiza comparação dos dois mercados mais baratos (compare.json)
async function renderCompare() {
  const compareData = await fetchJSON('../data/compare.json');

  // Ordena por valor total
  const sorted = compareData.sort((a, b) => a.total - b.total).slice(0, 2);

  const container = document.getElementById('compare-container');
  container.innerHTML = '<h3>Melhores opções:</h3>';

  sorted.forEach((market, index) => {
    const div = document.createElement('div');
    div.className = 'market';
    div.innerHTML = `
      <strong>${index + 1}º lugar: ${market.store}</strong><br>
      Total: R$ ${market.total.toFixed(2)}<br>
      Produtos encontrados: ${market.productsFound} / ${market.productsTotal}
    `;
    container.appendChild(div);
  });
}

// Inicializa
async function init() {
  await renderProducts();
  await renderCompare();
}

init();
