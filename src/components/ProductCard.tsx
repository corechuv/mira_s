import "react";
import { Link } from "../router";
import type { Product } from "../api/types";
import { price } from "../utils/money";
import { useReveal } from "../utils/hooks";

export default function ProductCard({ p }:{ p: Product }){
  const ref = useReveal<HTMLDivElement>();
  return (
    <article ref={ref as any} className="product-card card reveal" data-anim="zoom-in">
      <Link to={`/product/${p.slug}`} className="thumb"><img alt={p.title} src={p.images[0]} /></Link>
      <div style={{display:"grid",gap:6}}>
        <Link to={`/product/${p.slug}`} style={{fontWeight:700}}>{p.title}</Link>
        <p style={{color:"var(--muted)",fontSize:".95rem"}}>{p.short}</p>
        <div className="price"><span className="now">{price(p.price)}</span>{p.oldPrice && <span className="old">{price(p.oldPrice)}</span>}</div>
      </div>
    </article>
  );
}
