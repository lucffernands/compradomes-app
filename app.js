document.addEventListener("DOMContentLoaded", () => {
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

  // Caso mobile (select múltiplo)
  const select = document.getElementById("stores-select");
  if (select) {
    for (let option of select.selectedOptions) {
      stores.push(option.value.trim());
    }
  }

  // Caso desktop (checkboxes)
  const checkboxes = document.querySelectorAll("#stores-desktop input[type='checkbox']:checked");
  if (checkboxes.length > 0) {
    checkboxes.forEach(cb => stores.push(cb.value.trim()));
  }

  return stores;
}

// Função para tratar a busca
function handleSearch() {
  const productsInput = document.getElementById("products-input").value.trim();
  const resultsDiv = document.getElementById("results");

  // Validação
  if (!productsInput) {
    resultsDiv.innerHTML = "<p>⚠️ Digite pelo menos um produto.</p>";
    return;
  }

  const products = productsInput.split(",").map(p => p.trim()).filter(p => p);
  const stores = getSelectedStores();

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
