document.addEventListener("DOMContentLoaded", () => {

  // carregar fragment dos produtos
  fetch("fragments/products_hortolandia.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("products-container").innerHTML = html;
    });
  
  // carregar fragment dos supermercados dinamicamente
  fetch("fragments/stores_hortolandia.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("stores-container").innerHTML = html;

      // agora que o fragment foi injetado, adicionamos o evento do botão
      const searchBtn = document.getElementById("search-btn");
      searchBtn.addEventListener("click", handleSearch);
    });
});

// Função para coletar os supermercados selecionados
function getSelectedStores() {
  let stores = [];

  // Mobile (select múltiplo)
  const mobileSelect = document.getElementById("stores-select");
  if (mobileSelect) {
    for (let option of mobileSelect.selectedOptions) {
      stores.push(option.value.trim());
    }
  }

  // Desktop (select múltiplo)
  const desktopSelect = document.getElementById("stores-select-desktop");
  if (desktopSelect) {
    for (let option of desktopSelect.selectedOptions) {
      stores.push(option.value.trim());
    }
  }

  return stores;
}

// Função para coletar os produtos selecionados
function getSelectedProducts() {
  let products = [];

  // Mobile
  const mobileSelect = document.getElementById("products-select-mobile");
  if (mobileSelect) {
    for (let option of mobileSelect.selectedOptions) {
      products.push(option.value.trim());
    }
  }

  // Desktop
  const desktopSelect = document.getElementById("products-select-desktop");
  if (desktopSelect) {
    for (let option of desktopSelect.selectedOptions) {
      products.push(option.value.trim());
    }
  }

  return products;
}

// Função para tratar a busca
function handleSearch() {
  const resultsDiv = document.getElementById("results");

  const products = getSelectedProducts(); // agora pega do select
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
