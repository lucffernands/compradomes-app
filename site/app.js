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
      // Como JSON está vazio, mostra mensagem de teste
      output += `<li>${product}: Disponível para teste (digite supermercados acima)</li>`;
    });

    output += "</ul>";
    resDiv.innerHTML = output;

  } catch (err) {
    resDiv.innerHTML = "Erro ao carregar preços.";
    console.error(err);
  }
});
