import React from "react";
import { useWishlist } from "../store/store";
import ProductCard from "../components/ProductCard";
import { listProductsByIds } from "../api/products";

export default function WishlistPage(){
  const { state } = useWishlist();
  const [list, setList] = React.useState<any[]>([]);
  React.useEffect(()=>{ listProductsByIds(state.ids).then(setList).catch(console.error); },[state.ids.join(",")]);
  return (
    <div className="container" style={{display:"grid",gap:12}}>
      <h1>Wishlist</h1>
      <div className="grid-products">
        {list.map(p=> <ProductCard key={p.id} p={p}/>)}
      </div>
      {!list.length && <p style={{color:"var(--muted)"}}>Your wishlist is empty. Add products from the catalog pages.</p>}
    </div>
  );
}
