// Função para carregar dropdown de supermercados por cidade
async function loadStores(city = "hortolandia") {
  try {
    const res = await fetch(`fragments/stores_${city}.html`);
    const html = await res.text();
    document.getElementById("stores-container").innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar supermercados:", err);
  }
}

// Carrega os supermercados ao iniciar
loadStores();

// Evento do botão buscar preços
document.getElementById("search-btn").addEventListener("click", () => {
  const products = document.getElementById("products-input").value
    .split(",")
    .map(p => p.trim())
    .filter(p => p);

  const stores = Array.from(document.querySelectorAll('input[name="stores"]:checked'))
    .map(el => el.value);

  console.log("Produtos:", products);
  console.log("Mercados selecionados:", stores);
});


  // Lê os supermercados selecionados
  const storesSelect = document.getElementById("stores-select");
  const stores = Array.from(storesSelect.selectedOptions).map(option => option.value);

  const resDiv = document.getElementById("results");
  resDiv.innerHTML = ""; // limpa resultados anteriores

  if (!products.length || !stores.length) {
    resDiv.innerHTML = "<p class='slide-in'>Digite produtos e selecione pelo menos um supermercado!</p>";
    return;
  }

  // Cria lista de produtos com animação sequencial
  const ul = document.createElement("ul");
  ul.classList.add("staggered");

  products.forEach(product => {
    const li = document.createElement("li");
    li.textContent = `${product}: Disponível para teste (digite supermercados acima)`;
    ul.appendChild(li);
  });

  resDiv.appendChild(ul);
});
