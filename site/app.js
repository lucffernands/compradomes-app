const API_BASE = "https://seu-app-render.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");
  searchBtn.addEventListener("click", handleSearch);

  setupSelectAllProducts();
});

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
  stores.push(...getSelectedFromSelect("stores-select")); 
  stores.push(...getSelectedFromSelect("stores-select-desktop")); 
  return stores;
}

// Buscar preços reais
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

// Selecionar / desmarcar todos produtos
function toggleSelectAllProducts(toggle) {
  const selects = ["products-select-mobile", "products-select-desktop"];
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      for (let option of select.options) {
        option.selected = toggle;
      }
    }
  });
}

// Configura os links “Selecionar todos / Desmarcar todos” para produtos
function setupSelectAllProducts() {
  const selectAll = document.getElementById("select-all-products");
  const deselectAll = document.getElementById("deselect-all-products");

  if (selectAll) {
    selectAll.addEventListener("click", () => toggleSelectAllProducts(true));
  }
  if (deselectAll) {
    deselectAll.addEventListener("click", () => toggleSelectAllProducts(false));
  }
}

// Tratamento da busca
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
