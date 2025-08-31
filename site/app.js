document.getElementById("search-btn").addEventListener("click", async () => {
  const productsInput = document.getElementById("products-input").value;
  const storesInput = document.getElementById("stores-input").value;

  const products = productsInput.split(",").map(p => p.trim().toLowerCase());
  const stores = storesInput.split(",").map(s => s.trim());

  const resDiv = document.getElementById("results");
  resDiv.innerHTML = "Carregando preços...";

  try {
    const response = await fetch("prices.json");
    const data = await response.json();

    let output = "<h2>Resultados:</h2><ul>";

    products.forEach(product => {
      if (!data.products[product]) {
        output += `<li>${product}: Não disponível</li>`;
        return;
      }

      // filtra apenas supermercados digitados
      const available = Object.entries(data.products[product])
        .filter(([store, info]) => stores.includes(store));

      if (available.length === 0) {
        output += `<li>${product}: Não disponível nos supermercados escolhidos</li>`;
        return;
      }

      // escolhe o menor preço
      available.sort((a, b) => a[1].price - b[1].price);
      const [bestStore, bestInfo] = available[0];

      output += `<li>${product}: R$ ${bestInfo.price.toFixed(2)} em ${bestStore}</li>`;
    });

    output += "</ul>";
    resDiv.innerHTML = output;

  } catch (err) {
    resDiv.innerHTML = "Erro ao carregar preços.";
    console.error(err);
  }
});
