document.getElementById("search-btn").addEventListener("click", async () => {
  const productsInput = document.getElementById("products-input").value;
  const storesInput = document.getElementById("stores-input").value;

  const products = productsInput.split(",").map(p => p.trim().toLowerCase());
  const stores = storesInput.split(",").map(s => s.trim());

  const resDiv = document.getElementById("results");
  resDiv.innerHTML = "<ul>";

  products.forEach(product => {
    resDiv.innerHTML += `<li>${product}: Disponível para teste (digite supermercados acima)</li>`;
  });

  resDiv.innerHTML += "</ul>";
});
