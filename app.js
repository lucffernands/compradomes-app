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

      // Adicionar eventos do botão após fragment injetado
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

// Produtos
function getSelectedProducts() {
  let products = [];
  products.push(...getSelectedFromSelect("products-select-mobile"));
  products.push(...getSelectedFromSelect("products-select-desktop"));
  return products;
}

// Supermercados
function getSelectedStores() {
  let stores = [];
  stores.push(...getSelectedFromSelect("stores-select")); // mobile
  stores.push(...getSelectedFromSelect("stores-select-desktop")); // desktop
  return stores;
}

// -------- Select All / Deselect All --------
function toggleSelectAll(selectId, toggle) {
  const select = document.getElementById(selectId);
  if (select) {
    for (let option of select.options) {
      option.selected = toggle;
    }
  }
}

function setupSelectAllButtons() {
  const selectAllButtons = document.querySelectorAll(".select-all-btn");
  selectAllButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      const action = btn.dataset.action === "select";
      toggleSelectAll(target, action);
    });
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
