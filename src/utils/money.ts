export const fmtEUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
export const price = (n: number) => fmtEUR.format(n);
