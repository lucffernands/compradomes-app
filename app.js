document.addEventListener("DOMContentLoaded", () => {
  // Carregar fragment dos produtos
  fetch("fragments/products_hortolandia.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("products-container").innerHTML = html;
    });

  // Carregar fragment dos supermercados
  fetch("fragments/stores_hortolandia.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("stores-container").innerHTML = html;

      // Adicionar evento do botão após fragment ser injetado
      const searchBtn = document.getElementById("search-btn");
      searchBtn.addEventListener("click", handleSearch);

      // Ativar "Selecionar todos / Desmarcar todos"
      setupSelectAllButtons();
    });
});

// -------- Funções utilitárias --------

// Coletar itens selecionados de um <select multiple>
function getSelectedFromSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return [];
  return Array.from(select.selectedOptions).map(option => option.value.trim());
}

// Produtos selecionados
function getSelectedProducts() {
  let products = [];
  products.push(...getSelectedFromSelect("products-select-mobile"));
  products.push(...getSelectedFromSelect("products-select-desktop"));
  return products;
}

// Supermercados selecionados
function getSelectedStores() {
  let stores = [];
  stores.push(...getSelectedFromSelect("stores-select")); // mobile
  stores.push(...getSelectedFromSelect("stores-select-desktop")); // desktop
  return stores;
}

// -------- Selecionar / Desmarcar todos --------
function toggleSelectAll(selectId, toggle) {
  const select = document.getElementById(selectId);
  if (select) {
    for (let option of select.options) {
      option.selected = toggle;
    }
  }
}

function setupSelectAllButtons() {
  // MOBILE
  document.getElementById("select-all-products-mobile")?.addEventListener("click", () => {
    toggleSelectAll("products-select-mobile", true);
  });
  document.getElementById("deselect-all-products-mobile")?.addEventListener("click", () => {
    toggleSelectAll("products-select-mobile", false);
  });

  // DESKTOP
  document.getElementById("select-all-products-desktop")?.addEventListener("click", () => {
    toggleSelectAll("products-select-desktop", true);
  });
  document.getElementById("deselect-all-products-desktop")?.addEventListener("click", () => {
    toggleSelectAll("products-select-desktop", false);
  });
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
