import React from "react";
import { useRouter, Link } from "../router";
import Breadcrumbs from "../components/Breadcrumbs";
import { price } from "../utils/money";
import { supabase } from "../api/supabase";
import Reviews from "../components/Reviews";
import { Icon } from "../icons/Icon";
import { useCart, useWishlist, useCompare } from "../store/store";

type Prod = {
  id: string;
  slug: string;
  title: string;
  price: number;
  old_price: number | null;
  rating: number;
  rating_count: number;
  short: string | null;
  brand: string | null;
  category_l1: string; category_l2: string; category_l3: string;
};

export default function ProductPage(){
  const { params } = useRouter();
  const slug = params?.slug as string;

  const cart = useCart();
  const wish = useWishlist();
  const comp = useCompare();

  const [prod, setProd] = React.useState<Prod | null>(null);
  const [imgs, setImgs] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    let isMounted = true;
    (async ()=>{
      setLoading(true);
      const { data: p } = await supabase
        .from("products")
        .select("id,slug,title,price,old_price,rating,rating_count,short,brand,category_l1,category_l2,category_l3")
        .eq("slug", slug)
        .maybeSingle();
      const { data: pi } = await supabase
        .from("product_images")
        .select("url, sort, product_id")
        .in("product_id", p?.id ? [p.id] : ["00000000-0000-0000-0000-000000000000"])
        .order("sort", { ascending: true });

      if (isMounted){
        setProd(p as any || null);
        setImgs((pi||[]).map(x=>x.url));
        setLoading(false);
      }
    })();
    return ()=>{ isMounted = false; };
  },[slug]);

  if(loading) return <div className="container"><div className="card" style={{padding:16}}>Loading…</div></div>;
  if(!prod) return <div className="container"><div className="card" style={{padding:16}}>Product not found.</div></div>;

  const inWish = wish.state.ids.includes(prod.id);
  const inComp  = comp.state.ids.includes(prod.id);

  function addToCart(){
    // Собираем именно тот объект, что ждёт твой cartReducer (ProductUI)
    const productUI:any = { id: prod.id, price: prod.price, title: prod.title, slug: prod.slug, images: imgs };
    cart.dispatch({ type:"add", product: productUI, qty: 1 });
  }
  function toggleWish(){ wish.dispatch({ type:"toggle", id: prod.id }); }
  function toggleCompare(){ comp.dispatch({ type:"toggle", id: prod.id }); }

  return (
    <div className="container" style={{display:"grid", gap:16}}>
      <Breadcrumbs
        items={[
          { label:"Каталог", to:"/catalog" },
          { label: prod.category_l1, to:`/catalog/${encodeURIComponent(prod.category_l1)}` },
          { label: prod.category_l2, to:`/catalog/${encodeURIComponent(prod.category_l1)}/${encodeURIComponent(prod.category_l2)}` },
          { label: prod.title }
        ]}
      />

      <div className="card" style={{padding:16, display:"grid", gap:16}}>
        <div style={{display:"grid", gap:16, gridTemplateColumns:"minmax(260px,420px) 1fr"}}>
          {/* Галерея */}
          <div style={{display:"grid", gap:8}}>
            <div className="card" style={{padding:8, display:"grid", placeItems:"center", minHeight:300}}>
              {imgs[0] ? <img src={imgs[0]} alt={prod.title} style={{maxWidth:"100%", borderRadius:16}}/> : <div className="muted">No image</div>}
            </div>
            {imgs.length>1 && (
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {imgs.slice(1).map((u,i)=>(<img key={i} src={u} style={{width:72, height:72, objectFit:"cover", borderRadius:12}}/>))}
              </div>
            )}
          </div>

          {/* Инфо */}
          <div style={{display:"grid", gap:12}}>
            <h1 style={{margin:0}}>{prod.title}</h1>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div className="badge">{prod.rating.toFixed(1)} ★</div>
              <small className="muted">({prod.rating_count} reviews)</small>
            </div>
            <div style={{display:"flex", alignItems:"baseline", gap:10}}>
              <div className="price">{price(prod.price)}</div>
              {prod.old_price && <div className="price-old">{price(prod.old_price)}</div>}
            </div>
            {prod.short && <p style={{marginTop:8}}>{prod.short}</p>}

            {/* ACTION BAR */}
            <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
              <button className="btn primary" onClick={addToCart}>
                <Icon name="cart" /> <span style={{marginLeft:6}}>Add to Cart</span>
              </button>

              <button className={"btn"+(inWish?" active":"")} onClick={toggleWish} title={inWish?"Remove from Wishlist":"Add to Wishlist"}>
                <Icon name="heart" />
                <span style={{marginLeft:6}}>{inWish?"In Wishlist":"Add to Wishlist"}</span>
              </button>

              <button className={"btn"+(inComp?" active":"")} onClick={toggleCompare} title={inComp?"Remove from Compare":"Add to Compare"}>
                <Icon name="scale" />
                <span style={{marginLeft:6}}>{inComp?"In Compare":"Add to Compare"}</span>
              </button>

              <Link to="/compare" className="btn" title="Open Compare">
                <Icon name="arrow-right" /><span style={{marginLeft:6}}>Compare</span>
              </Link>
            </div>

            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <Link to="/catalog" className="btn">Back to Catalog</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Отзывы */}
      <Reviews productId={prod.id} />
    </div>
  );
}
