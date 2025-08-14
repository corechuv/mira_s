import React from "react";
import { useRouter } from "../router";
import ProductCard from "../components/ProductCard";
import { listProducts } from "../api/products";

export default function SearchPage(){
  const { search } = useRouter();
  const params = new URLSearchParams(search);
  const q = (params.get("q") ?? "");
  const [found, setFound] = React.useState<any[]>([]);
  React.useEffect(()=>{ listProducts({ q, limit: 40 }).then(setFound).catch(console.error); },[q]);
  return (
    <div className="container" style={{display:"grid",gap:12}}>
      <h1>Поиск: “{q}”</h1>
      <div className="grid-products">
        {found.map(p => <ProductCard key={p.id} p={p}/>)}
      </div>
      {!found.length && <p style={{color:"var(--muted)"}}>Ничего не найдено.</p>}
    </div>
  );
}
