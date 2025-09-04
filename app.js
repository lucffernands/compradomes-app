// app.js

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadStores();

  document.getElementById('search-btn').addEventListener('click', () => {
    comparePrices();
  });
});

// ---- Carregar fragment de produtos ----
async function loadProducts() {
  try {
    const res = await fetch('./fragments/products_hortolandia.html');
    const htmlText = await res.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;

    const mobileActions = tempDiv.querySelector('.mobile-only .select-actions')?.outerHTML || '';
    const desktopActions = tempDiv.querySelector('.desktop-only .select-actions')?.outerHTML || '';
    const mobileSelect = tempDiv.querySelector('#products-select-mobile')?.outerHTML || '';
    const desktopSelect = tempDiv.querySelector('#products-select-desktop')?.outerHTML || '';

    document.getElementById('products-container').innerHTML = `
      <div class="mobile-only">
        <label for="products-select-mobile">Produtos:</label>
        ${mobileActions}
        ${mobileSelect}
      </div>
      <div class="desktop-only">
        <label for="products-select-desktop">Produtos:</label>
        ${desktopActions}
        ${desktopSelect}
      </div>
    `;

    // Listeners produtos
    document.getElementById('select-all-products-mobile')?.addEventListener('click', () => {
      Array.from(document.getElementById('products-select-mobile').options).forEach(opt => opt.selected = true);
    });
    document.getElementById('deselect-all-products-mobile')?.addEventListener('click', () => {
      Array.from(document.getElementById('products-select-mobile').options).forEach(opt => opt.selected = false);
    });
    document.getElementById('select-all-products-desktop')?.addEventListener('click', () => {
      Array.from(document.getElementById('products-select-desktop').options).forEach(opt => opt.selected = true);
    });
    document.getElementById('deselect-all-products-desktop')?.addEventListener('click', () => {
      Array.from(document.getElementById('products-select-desktop').options).forEach(opt => opt.selected = false);
    });

  } catch (err) {
    console.error('Erro ao carregar fragment products:', err);
    document.getElementById('products-container').innerHTML = '<p>Produto indisponível</p>';
  }
}

// ---- Carregar fragment de supermercados ----
async function loadStores() {
  try {
    const res = await fetch('./fragments/stores_hortolandia.html');
    const htmlText = await res.text();
    document.getElementById('stores-container').innerHTML = htmlText;
  } catch (err) {
    console.error('Erro ao carregar fragment stores:', err);
    document.getElementById('stores-container').innerHTML = '<p>Supermercado indisponível</p>';
  }
}

// ---- Buscar preços e comparar ----
async function comparePrices() {
  try {
    const res = await fetch('./data/prices.json');
    const pricesData = await res.json();

    // Pegando selects corretos (mobile ou desktop)
    const productsSelect = document.getElementById('products-select-desktop') || document.getElementById('products-select-mobile');
    const storesSelect = document.getElementById('stores-select-desktop') || document.getElementById('stores-select-mobile');

    const selectedProducts = Array.from(productsSelect.selectedOptions).map(opt => opt.value);
    const selectedStores = Array.from(storesSelect.selectedOptions).map(opt => opt.value);

    if (!selectedProducts.length || !selectedStores.length) {
      alert('Selecione ao menos um produto e um supermercado.');
      return;
    }

    // Calcular total por supermercado
    const totals = selectedStores.map(store => {
      let totalValue = 0;
      let foundProducts = 0;

      selectedProducts.forEach(product => {
        if (pricesData.stores[store] && pricesData.stores[store][product]) {
          totalValue += pricesData.stores[store][product];
          foundProducts++;
        }
      });

      return { store, totalValue, foundProducts };
    });

    // Ordenar por menor total
    totals.sort((a, b) => a.totalValue - b.totalValue);

    // Mostrar os dois mais baratos
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
      <h2>Mercados mais baratos</h2>
      ${totals.slice(0, 2).map(t => `
        <div class="market-result">
          <strong>${t.store}</strong> - Total: R$ ${t.totalValue.toFixed(2)} - Produtos encontrados: ${t.foundProducts}/${selectedProducts.length}
        </div>
      `).join('')}
    `;

  } catch (err) {
    console.error('Erro ao comparar mercados:', err);
    document.getElementById('results').innerHTML = '<p>Erro ao buscar preços.</p>';
  }
                                                                                     }
