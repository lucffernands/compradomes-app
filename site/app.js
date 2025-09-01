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

      // Adicionar "Selecionar todos / Desmarcar todos" para produtos e supermercados
      setupSelectAllButtons();
    });
});

// Função para coletar itens selecionados de um select múltiplo
function getSelectedFromSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return [];
  return Array.from(select.selectedOptions).map(option => option.value.trim());
}

// Função para coletar itens selecionados de checkboxes
function getSelectedFromCheckbox(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const checkboxes = container.querySelectorAll("input[type='checkbox']:checked");
  return Array.from(checkboxes).map(cb => cb.value.trim());
}

// Função para coletar produtos selecionados
function getSelectedProducts() {
  let products = [];

  // Mobile
  products.push(...getSelectedFromSelect("products-select-mobile"));

  // Desktop
  products.push(...getSelectedFromSelect("products-select-desktop"));

  return products;
}

// Função para coletar supermercados selecionados
function getSelectedStores() {
  let stores = [];

  // Mobile
  stores.push(...getSelectedFromSelect("stores-select"));

  // Desktop
  stores.push(...getSelectedFromSelect("stores-select-desktop"));

  return stores;
}

// Função para selecionar/desmarcar todos itens de um select
function toggleSelectAll(selectId, toggle) {
  const select = document.getElementById(selectId);
  if (!select) return;
  for (let option of select.options) {
    option.selected = toggle;
  }
}

// Configura os botões "Selecionar todos / Desmarcar todos"
function setupSelectAllButtons() {
  const selectAllButtons = document.querySelectorAll(".select-all-btn");
  selectAllButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectId = btn.dataset.target;
      const action = btn.dataset.action === "select";
      toggleSelectAll(selectId, action);
    });
  });
}

// Função para tratar a busca
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
