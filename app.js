// app.js

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

// Função para carregar fragment de produtos
async function loadProducts() {
  try {
    const res = await fetch('./fragments/products_hortolandia.html');
    const htmlText = await res.text();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;

    // Mantém os spans de ações
    const mobileActions = tempDiv.querySelector('.mobile-only .select-actions')?.outerHTML || '';
    const desktopActions = tempDiv.querySelector('.desktop-only .select-actions')?.outerHTML || '';

    const mobileOptions = tempDiv.querySelector('#products-select-mobile')?.outerHTML || '';
    const desktopOptions = tempDiv.querySelector('#products-select-desktop')?.outerHTML || '';

    // Monta o container com selects + spans
    document.getElementById('products-container').innerHTML = `
      <div class="mobile-only">
        <label for="products-select-mobile">Produtos:</label>
        ${mobileActions}
        ${mobileOptions}
      </div>
      <div class="desktop-only">
        <label for="products-select-desktop">Produtos:</label>
        ${desktopActions}
        ${desktopOptions}
      </div>
    `;

    // Adiciona listeners para os spans de ação
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
    document.getElementById('products-container').innerHTML = '<option>Produto indisponível</option>';
  }
                 }
