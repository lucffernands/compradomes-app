document.getElementById("search-btn").addEventListener("click", async () => {
  const productsInput = document.getElementById("products-input").value;
  const storesInput = document.getElementById("stores-input").value;

  const products = productsInput.split(",").map(p => p.trim().toLowerCase());
  const stores = storesInput.split(",").map(s => s.trim());

  const resDiv = document.getElementById("results");
  resDiv.innerHTML = ""; // limpa resultados anteriores

  const ul = document.createElement("ul");
  ul.classList.add("staggered"); // animação sequencial

  products.forEach(product => {
    const li = document.createElement("li");
    li.textContent = `${product}: Disponível para teste (digite supermercados acima)`;
    ul.appendChild(li);
  });

  resDiv.appendChild(ul);
});
