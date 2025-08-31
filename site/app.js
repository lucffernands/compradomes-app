document.getElementById("search-btn").addEventListener("click", () => {
  const productsInput = document.getElementById("products-input").value;

  // produtos digitados
  const products = productsInput
    .split(",")
    .map(p => p.trim())
    .filter(p => p);

  let stores = [];

  // 🔹 mobile: select múltiplo
  const mobileSelect = document.getElementById("stores-mobile");
  if (mobileSelect && mobileSelect.selectedOptions.length > 0) {
    stores = Array.from(mobileSelect.selectedOptions).map(opt => opt.value);
  }

  // 🔹 desktop: checkboxes
  const desktopStores = document.querySelectorAll("#stores-desktop input[type=checkbox]:checked");
  if (desktopStores.length > 0) {
    stores = Array.from(desktopStores).map(cb => cb.value);
  }

  // exibindo resultados de teste
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h2>Resultados:</h2>";

  products.forEach(product => {
    const p = document.createElement("p");
    p.textContent = `${product}: Disponível para teste (mercados escolhidos: ${stores.join(", ") || "nenhum"})`;
    resultsDiv.appendChild(p);
  });
});
