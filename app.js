// site/app.js

async function loadFragment(path, selectIdMobile, selectIdDesktop, containerId) {
  try {
    const res = await fetch(path);
    const htmlText = await res.text();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;

    const mobileOptions = tempDiv.querySelector(`#${selectIdMobile}`)?.innerHTML || '';
    const desktopOptions = tempDiv.querySelector(`#${selectIdDesktop}`)?.innerHTML || '';

    document.getElementById(containerId).innerHTML = `
      <div class="mobile-only">
        <label for="${selectIdMobile}">Selecione:</label>
        <select id="${selectIdMobile}" multiple>${mobileOptions}</select>
      </div>
      <div class="desktop-only">
        <label for="${selectIdDesktop}">Selecione:</label>
        <select id="${selectIdDesktop}" multiple size="10">${desktopOptions}</select>
      </div>
    `;
  } catch (err) {
    console.error(`Erro ao carregar fragment ${path}:`, err);
    document.getElementById(containerId).innerHTML = '<option>Indisponível</option>';
  }
}

async function loadProducts() {
  await loadFragment(
    './fragments/products_hortolandia.html',
    'products-select-mobile',
    'products-select-desktop',
    'products-container'
  );
}

async function loadStores() {
  await loadFragment(
    './fragments/stores_hortolandia.html',
    'stores-select-mobile',
    'stores-select-desktop',
    'stores-container'
  );
}

// Inicializa selects
loadProducts();
loadStores();

// Botão de busca
document.getElementById('search-btn').addEventListener('click', () => {
  const productsMobile = Array.from(document.getElementById('products-select-mobile')?.selectedOptions || []).map(o => o.value);
  const productsDesktop = Array.from(document.getElementById('products-select-desktop')?.selectedOptions || []).map(o => o.value);
  const storesMobile = Array.from(document.getElementById('stores-select-mobile')?.selectedOptions || []).map(o => o.value);
  const storesDesktop = Array.from(document.getElementById('stores-select-desktop')?.selectedOptions || []).map(o => o.value);

  const selectedProducts = productsMobile.length ? productsMobile : productsDesktop;
  const selectedStores = storesMobile.length ? storesMobile : storesDesktop;

  console.log('Produtos selecionados:', selectedProducts);
  console.log('Supermercados selecionados:', selectedStores);

  // Aqui você chamaria sua função de buscar preços e mostrar resultados
});
