import "react";
import { Link } from "../router";
import type { Product } from "../api/types";
import { Icon } from "../icons/Icon";
import { useCompare, useWishlist } from "../store/store";
import { price } from "../utils/money";
import { useReveal } from "../utils/hooks";

export default function ProductCard({ p }:{ p: Product }){
  const { state: w, dispatch: wishlist } = useWishlist();
  const { state: c, dispatch: compare } = useCompare();
  const ref = useReveal<HTMLDivElement>();

  const wished = w.ids.includes(p.id);
  const compared = c.ids.includes(p.id);

  return (
    <article ref={ref as any} className="product-card card reveal" data-anim="zoom-in">
      <Link to={`/product/${p.slug}`} className="thumb"><img alt={p.title} src={p.images[0]} /></Link>
      <div style={{display:"grid",gap:6}}>
        <Link to={`/product/${p.slug}`} style={{fontWeight:700}}>{p.title}</Link>
        <p style={{color:"var(--muted)",fontSize:".95rem"}}>{p.short}</p>
        <div className="price"><span className="now">{price(p.price)}</span>{p.oldPrice && <span className="old">{price(p.oldPrice)}</span>}</div>
        <div style={{display:"flex",justifyContent:"start",alignItems:"center",gap:8}}>
          <button className={"btn icon"+(wished?" primary":"")} onClick={()=>wishlist({type:"toggle", id:p.id})} aria-label="Избранное"><Icon name="heart"/></button>
          <button className={"btn icon"+(compared?" primary":"")} onClick={()=>compare({type:"toggle", id:p.id})} aria-label="Сравнение"><Icon name="compare"/></button>
        </div>
      </div>
    </article>
  );
}
