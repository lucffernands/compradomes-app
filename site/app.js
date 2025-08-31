async function loadPrices() {
  const res = await fetch('../data/prices.json');
  if (!res.ok) {
    console.error('Erro ao carregar prices.json');
    return null;
  }
  return res.json();
}

const state = {
  prices: null,
  selectedProducts: []
};

function renderComparison() {
  const container = document.getElementById('comparison-list');
  container.innerHTML = '';

  if (state.selectedProducts.length === 0) {
    container.innerHTML = '<p class="text-gray-500">Nenhum produto selecionado.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'min-w-full border border-gray-300 text-sm';

  // Cabeçalho
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `
    <th class="border p-2">Produto</th>
    ${state.prices.stores.map(s => `<th class="border p-2">${s}</th>`).join('')}
  `;
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Corpo
  const tbody = document.createElement('tbody');
  for (const product of state.selectedProducts) {
    const row = document.createElement('tr');
    const prices = state.prices.products[product] || {};
    row.innerHTML = `
      <td class="border p-2 font-medium">${product}</td>
      ${state.prices.stores.map(store => {
        const it = prices[store];
        return `<td class="border p-2">${it ? `R$ ${it.price.toFixed(2)}` : '-'}</td>`;
      }).join('')}
    `;
    tbody.appendChild(row);
  }
  table.appendChild(tbody);

  container.appendChild(table);
}

function renderSummary() {
  const summaryDiv = document.getElementById('summary-content');
  summaryDiv.innerHTML = '';

  if (state.selectedProducts.length === 0) {
    summaryDiv.innerHTML = '<p class="text-gray-500">Nenhum produto selecionado.</p>';
    return;
  }

  const totals = {};
  for (const store of state.prices.stores) {
    totals[store] = 0;
  }

  for (const product of state.selectedProducts) {
    const prices = state.prices.products[product] || {};
    let best = null;
    for (const store of state.prices.stores) {
      if (prices[store]) {
        if (!best || prices[store].price < best.price) {
          best = { ...prices[store], store };
        }
      }
    }
    if (best) {
      totals[best.store] += best.price;
    }
  }

  const entries = Object.entries(totals).map(([store, total]) => ({ store, total }));
  entries.sort((a, b) => a.total - b.total);

  const ul = document.createElement('ul');
  for (const e of entries) {
    const li = document.createElement('li');
    li.textContent = `${e.store}: R$ ${e.total.toFixed(2)}`;
    ul.appendChild(li);
  }
  summaryDiv.appendChild(ul);

  const best = entries[0];
  const p = document.createElement('p');
  p.className = 'mt-2 font-bold text-green-700';
  p.textContent = `Mais barato no ${best.store}: R$ ${best.total.toFixed(2)}`;
  summaryDiv.appendChild(p);
}

document.getElementById('add-product').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('product-input');
  const value = input.value.trim();
  if (value && !state.selectedProducts.includes(value)) {
    state.selectedProducts.push(value);
    renderComparison();
    renderSummary();
  }
  input.value = '';
});

(async function init() {
  state.prices = await loadPrices();
  if (!state.prices) return;
  renderComparison();
  renderSummary();
})();
