const API_BASE = "https://compradomes-app.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");
  searchBtn.addEventListener("click", handleSearch);

  // carregar produtos e só depois configurar os botões
  fetch("fragments/products_hortolandia.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("products-container").innerHTML = html;
      setupSelectAllProducts(); // só roda depois do HTML injetado
    });

  // carregar supermercados
  fetch("fragments/stores_hortolandia.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("stores-container").innerHTML = html;
    });
});

// --- Funções auxiliares ---

function getSelectedFromSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return [];
  return Array.from(select.selectedOptions).map(option => option.value.trim());
}

function getSelectedProducts() {
  let products = [];
  products.push(...getSelectedFromSelect("products-select-mobile"));
  products.push(...getSelectedFromSelect("products-select-desktop"));
  return products;
}

function getSelectedStores() {
  let stores = [];
  stores.push(...getSelectedFromSelect("stores-select"));
  stores.push(...getSelectedFromSelect("stores-select-desktop"));
  return stores;
}

async function fetchPrices(products, stores) {
  const query = new URLSearchParams();
  query.append("products", products.join(","));
  query.append("stores", stores.join(","));

  try {
    const response = await fetch(`${API_BASE}/api/scrape?${query.toString()}`);
    if (!response.ok) throw new Error("Erro na requisição");
    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// configurar os botões "Selecionar todos / Desmarcar todos"
function setupSelectAllProducts() {
  const buttons = [
    { selectAll: "select-all-products-mobile", deselectAll: "deselect-all-products-mobile", target: "products-select-mobile" },
    { selectAll: "select-all-products-desktop", deselectAll: "deselect-all-products-desktop", target: "products-select-desktop" },
  ];

  buttons.forEach(({ selectAll, deselectAll, target }) => {
    const allBtn = document.getElementById(selectAll);
    const noneBtn = document.getElementById(deselectAll);
    const selectEl = document.getElementById(target);

    if (allBtn && selectEl) {
      allBtn.addEventListener("click", () => {
        for (let option of selectEl.options) option.selected = true;
      });
    }

    if (noneBtn && selectEl) {
      noneBtn.addEventListener("click", () => {
        for (let option of selectEl.options) option.selected = false;
      });
    }
  });
}

// buscar preços
async function handleSearch() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Carregando...</p>";

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

  const prices = await fetchPrices(products, stores);
  if (!prices) {
    resultsDiv.innerHTML = "<p>⚠️ Erro ao buscar preços.</p>";
    return;
  }

  let html = "<h2>Resultados:</h2><ul>";
  for (const product of products) {
    html += `<li><strong>${product}</strong>: `;
    const productPrices = prices[product];
    if (!productPrices || Object.keys(productPrices).length === 0) {
      html += "Não disponível em nenhum supermercado";
    } else {
      html += Object.entries(productPrices)
        .map(([store, price]) => `${store}: ${price}`)
        .join(" | ");
    }
    html += "</li>";
  }
  html += "</ul>";
  resultsDiv.innerHTML = html;
    }
