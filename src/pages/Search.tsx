import React from "react";
import { useRouter } from "../router";
import ProductCard from "../components/ProductCard";
import { listProducts } from "../api/products";
import { useSearch } from "../store/store";
import { Icon } from "../icons/Icon";

export default function SearchPage() {
  const { push } = useRouter();
  const { q: searchQ, setQ } = useSearch();
  function onSubmit(e: React.FormEvent) { e.preventDefault(); push("/search?q=" + encodeURIComponent(searchQ)); }
  const { search } = useRouter();
  const params = new URLSearchParams(search);
  const q = (params.get("q") ?? "");
  const [found, setFound] = React.useState<any[]>([]);
  React.useEffect(() => { listProducts({ q, limit: 40 }).then(setFound).catch(console.error); }, [q]);
  return (
    <div className="container" style={{ display: "grid", gap: 12 }}>
      <h1>Поиск: “{q}”</h1>
      <form className="search" onSubmit={onSubmit}>
        <input className="input" placeholder="Поиск товаров..." value={searchQ} onChange={e => setQ(e.target.value)} aria-label="Поиск" />
        <button className="" type="submit"><Icon name="search" /></button>
      </form>
      <div className="grid-products">
        {found.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
      {!found.length && <p style={{ color: "var(--muted)" }}>Ничего не найдено.</p>}
    </div>
  );
}
