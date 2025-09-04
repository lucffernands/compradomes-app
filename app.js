// app.js

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadStores();
});

// Carrega fragment de produtos e mantém "Selecionar todos / Desmarcar todos"
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

    // Listeners apenas para produtos
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

// Carrega fragment de supermercados (sem spans de selecionar todos)
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
