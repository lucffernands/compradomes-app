export function parsePriceBR(txt) {
  if (!txt) return null;
  const digits = txt.replace(/[^0-9,]/g, '').replace(',', '.');
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}
