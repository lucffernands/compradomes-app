const productsInput = document.getElementById("products-input");
const storesInput = document.getElementById("stores-input");
const searchBtn = document.getElementById("search-btn");
const resultsDiv = document.getElementById("results");

let pricesData = {};

async function loadPrices() {
  const res = await fetch("prices.json");
  pricesData = await res.json();
}

// Função para comparar produtos e distribuir nos melhores supermercados
function comparePrices(selectedProducts, selectedStores) {
  const productAssignments = {}; // produto → supermercado
  const totals = {}; // supermercado → total
  selectedStores.forEach(store => totals[store] = 0);

  selectedProducts.forEach(product => {
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
      productAssignments[product] = best;
      totals[best.store] += best.price;
    } else {
      productAssignments[product] = null;
    }
  });

  // Ordena os supermercados pelo total gasto (menor total primeiro)
  const sortedStores = Object.entries(totals)
    .filter(([s, total]) => total > 0)
    .sort((a,b) => a[1]-b[1])
    .map(([s, total]) => s);

  // Monta a tabela de produtos e supermercado
  const table = document.createElement("table");
  table.className = "table-auto border-collapse border border-gray-300 w-full mb-4";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Produto", "Onde comprar", "Preço"].forEach(text => {
    const th = document.createElement("th");
    th.className = "border border-gray-300 px-2 py-1 bg-gray-100";
    th.innerText = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  selectedProducts.forEach(product => {
    const row = document.createElement("tr");

    const tdProduct = document.createElement("td");
    tdProduct.className = "border border-gray-300 px-2 py-1";
    tdProduct.innerText = product;
    row.appendChild(tdProduct);

    const tdStore = document.createElement("td");
    tdStore.className = "border border-gray-300 px-2 py-1";

    const tdPrice = document.createElement("td");
    tdPrice.className = "border border-gray-300 px-2 py-1";

    const assignment = productAssignments[product];
    if (assignment) {
      tdStore.innerText = assignment.store;
      tdPrice.innerText = `R$ ${assignment.price.toFixed(2)}`;
    } else {
      tdStore.innerText = "Não disponível";
      tdPrice.innerText = "-";
    }

    row.appendChild(tdStore);
    row.appendChild(tdPrice);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  resultsDiv.innerHTML = "";
  resultsDiv.appendChild(table);

  // Resumo dos dois melhores supermercados
  const summary = document.createElement("div");
  summary.className = "mb-4";
  summary.innerHTML = "<h3 class='text-lg font-semibold mb-2'>Resumo por supermercado:</h3>";

  sortedStores.slice(0,2).forEach(store => {
    summary.innerHTML += `<p>${store}: R$ ${totals[store].toFixed(2)}</p>`;
  });

  resultsDiv.appendChild(summary);
}

// Evento do botão
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
