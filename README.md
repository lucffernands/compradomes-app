# 🛒 Compra do Mês

Aplicativo web para consultar preços de produtos em supermercados de Hortolândia.  
O usuário pode selecionar produtos e supermercados, e o sistema retorna preços simulados ou reais.

## 🗂 Estrutura do Projeto
```
📁 compradomes-app/
├─ 📁 .github/
│  └─ 📁 workflows/
│     └─ scrape.yml
├─ 📁 data/
│  ├─ 📄 prices.json
│  ├─ 📄 sku_map.csv
│  └─ 📄 stores.json
├─ 📁 fragments/
│  ├─ 📄 products_hortolandia.html
│  └─ 📄 stores_hortolandia.html
├─ 📁 scrapers/
│  ├─ 📄 scrape.cjs
│  ├─ 📄 package.json
│  └─ 📄 utils.js
📁 site/ 
├─ 📄 styles.css
├─ 📄 app.js
└─ 📄 index.html
```
## ⚡ Como usar

1. Clonar o repositório:
```bash
git clone https://github.com/seu-usuario/compradomes-app.git
```
2. Instalar dependências do scraper:



cd scrapers
npm install

3. Rodar scraper:



node scrape.cjs

4. Abrir index.html no navegador ou publicar no GitHub Pages.



##🎨 Funcionalidades

Seleção de produtos via select múltiplo (desktop e mobile).

Seleção de supermercados disponíveis online.

Botões "Selecionar todos" / "Desmarcar todos" nos produtos.

Exibição de resultados simulados ou reais.


##🔧 Observações

Fragmentos HTML carregados dinamicamente (fragments/).

Estilos em styles.css e lógica em app.js.

Dados de produtos e supermercados em data/.


