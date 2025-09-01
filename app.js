document.addEventListener("DOMContentLoaded", () => {
  // Carregar fragment dos produtos
  fetch("fragments/products_hortolandia.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("products-container").innerHTML = html;
      setupProductSelectAll(); // configurar links de selecionar/desmarcar
    });

  // Carregar fragment dos supermercados
  fetch("fragments/stores_hortolandia.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("stores-container").innerHTML = html;
    });

  // Evento do botão após tudo carregado
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) searchBtn.addEventListener("click", handleSearch);
});

// Função para selecionar/desmarcar todos itens de um select
function toggleSelectAll(selectId, toggle) {
  const select = document.getElementById(selectId);
  if (!select) return;
  for (let option of select.options) {
    option.selected = toggle;
  }
}

// Configura os spans "Selecionar todos / Desmarcar todos" para produtos
function setupProductSelectAll() {
  // Mobile
  const selectAllMobile = document.getElementById("select-all-products");
  const deselectAllMobile = document.getElementById("deselect-all-products");
  if (selectAllMobile && deselectAllMobile) {
    selectAllMobile.addEventListener("click", () => toggleSelectAll("products-select", true));
    deselectAllMobile.addEventListener("click", () => toggleSelectAll("products-select", false));
  }

  // Desktop
  const selectAllDesktop = document.getElementById("select-all-products-desktop");
  const deselectAllDesktop = document.getElementById("deselect-all-products-desktop");
  if (selectAllDesktop && deselectAllDesktop) {
    selectAllDesktop.addEventListener("click", () => toggleSelectAll("products-select-desktop", true));
    deselectAllDesktop.addEventListener("click", () => toggleSelectAll("products-select-desktop", false));
  }
}

// -------- Coleta de itens selecionados --------
function getSelectedFromSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return [];
  return Array.from(select.selectedOptions).map(option => option.value.trim());
}

function getSelectedProducts() {
  let products = [];
  products.push(...getSelectedFromSelect("products-select")); // Mobile
  products.push(...getSelectedFromSelect("products-select-desktop")); // Desktop
  return products;
}

function getSelectedStores() {
  let stores = [];
  stores.push(...getSelectedFromSelect("stores-select")); // Mobile
  stores.push(...getSelectedFromSelect("stores-select-desktop")); // Desktop
  return stores;
}

// -------- Busca --------
function handleSearch() {
  const resultsDiv = document.getElementById("results");
  const products = getSelectedProducts();
  const stores = getSelectedStores();

  if (products.length === 0) {
    resultsDiv.innerHTML = "<p>⚠️ Selecione pelo menos um produto.</p>";
    return;
  }
  if (stores.length === 0) {
    resultsDiv.innerHTML = "<p>⚠️ Selecione pelo menos um supermercado.</p>";
    return;
  }

  // Exibir resultados simulados
  let html = "<h2>Resultados:</h2><ul>";
  for (const product of products) {
    html += `<li><strong>${product}</strong>: Disponível para teste (mercados escolhidos: ${stores.join(", ")})</li>`;
  }
  html += "</ul>";
  resultsDiv.innerHTML = html;
}
