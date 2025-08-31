const productsInput = document.getElementById("products-input");
const storesInput = document.getElementById("stores-input");
const searchBtn = document.getElementById("search-btn");
const resultsDiv = document.getElementById("results");

let pricesData = {};

// Carrega o prices.json
async function loadPrices() {
  const res = await fetch("prices.json");
  pricesData = await res.json();
}

function comparePrices(selectedProducts, selectedStores) {
  const table = document.createElement("table");
  table.className = "table-auto border-collapse border border-gray-300 w-full mb-4";

  // Cabeçalho da tabela
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Produto", "Melhor Preço em"].forEach(text => {
    const th = document.createElement("th");
    th.className = "border border-gray-300 px-2 py-1 bg-gray-100";
    th.innerText = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  // Totais por supermercado
  const totals = {};
  selectedStores.forEach(store => totals[store] = 0);

  selectedProducts.forEach(product => {
    const row = document.createElement("tr");
    const tdProduct = document.createElement("td");
    tdProduct.className = "border border-gray-300 px-2 py-1";
    tdProduct.innerText = product;
    row.appendChild(tdProduct);

    const tdBest = document.createElement("td");
    tdBest.className = "border border-gray-300 px-2 py-1";

    const productPrices = pricesData.products[product] || {};
    let best = null;
    selectedStores.forEach(store => {
      if (productPrices[store]) {
        if (!best || productPrices[store].price < best.price) {
          best = { store, price: productPrices[store].price };
        }
      }
    });

    if (best) {
      tdBest.innerText = `${best.store} (R$ ${best.price.toFixed(2)})`;
      totals[best.store] += best.price;
    } else {
      tdBest.innerText = "Não disponível";
    }

    row.appendChild(tdBest);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  resultsDiv.innerHTML = "";
  resultsDiv.appendChild(table);

  // Mostrar resumo dos supermercados
  const summary = document.createElement("div");
  summary.className = "mb-4";
  summary.innerHTML = "<h3 class='text-lg font-semibold mb-2'>Resumo Total:</h3>";

  // Ordena pelo menor total
  const sortedTotals = Object.entries(totals).sort((a,b) => a[1] - b[1]);
  sortedTotals.forEach(([store, total]) => {
    summary.innerHTML += `<p>${store}: R$ ${total.toFixed(2)}</p>`;
  });

  resultsDiv.appendChild(summary);
}

// Event listener
searchBtn.addEventListener("click", () => {
  const selectedProducts = productsInput.value.split(",").map(p => p.trim()).filter(p => p);
  const selectedStores = storesInput.value.split(",").map(s => s.trim()).filter(s => s);
  if (selectedProducts.length === 0 || selectedStores.length === 0) {
    alert("Digite pelo menos um produto e um supermercado.");
    return;
  }
  comparePrices(selectedProducts, selectedStores);
});

// Carrega os preços ao iniciar
loadPrices();
