import React from "react";
import { Link } from "../router";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { listProducts } from "../api/products";

export default function Home(){
  const [picks, setPicks] = React.useState<any[]>([]);
  React.useEffect(()=>{ listProducts({ limit: 8, sort: "rating_desc" }).then(setPicks).catch(console.error); },[]);
  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <Reveal anim="fade-up">
        <section className="card" style={{padding:24,display:"grid",gap:12}}>
          <h1 style={{fontSize:"2rem"}}>Шото написать</h1>
          <p style={{color:"var(--muted)"}}>Шото красиво дописать</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Link to="/catalog" className="btn primary">Catalog</Link>
            <Link to="/search?q=шото" className="btn">Шото искать</Link>
          </div>
        </section>
      </Reveal>
      <section style={{display:"grid",gap:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h2>Today's Picks</h2>
          <Link to="/catalog" className="link">View All →</Link>
        </div>
        <div className="grid-products">
          {picks.map(p=> <ProductCard key={p.id} p={p}/>)}
        </div>
      </section>
    </div>
  );
}
