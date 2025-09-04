// site/app.js

async function loadOptions(fragment) {
  try {
    const res = await fetch(`data/${fragment}.json`);
    const options = await res.json();
    return options;
  } catch (err) {
    console.error(`Erro ao carregar ${fragment}:`, err);
    return [];
  }
}

async function init() {
  const products = await loadOptions('products_hortolandia');
  const stores = await loadOptions('stores_hortolandia');

  const productsContainer = document.getElementById('products-container');
  const storesContainer = document.getElementById('stores-container');

  if (products.length > 0) {
    productsContainer.innerHTML = `
      <label>Produtos:</label>
      <select multiple>
        ${products.map(p => `<option>${p}</option>`).join('')}
      </select>
    `;
  } else {
    productsContainer.innerHTML = `<p>Nenhum produto disponível</p>`;
  }

  if (stores.length > 0) {
    storesContainer.innerHTML = `
      <label>Supermercados:</label>
      <select multiple>
        ${stores.map(s => `<option>${s}</option>`).join('')}
      </select>
    `;
  } else {
    storesContainer.innerHTML = `<p>Nenhum supermercado disponível</p>`;
  }
}

// Inicializa
init();
