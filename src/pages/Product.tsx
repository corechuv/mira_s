import React from "react";
import { useRouter, Link } from "../router";
import Breadcrumbs from "../components/Breadcrumbs";
import Reviews from "../components/Reviews";
import { Icon } from "../icons/Icon";
import { useCart, useViewed, useWishlist, useCompare } from "../store/store";
import { price } from "../utils/money";
import { getProductBySlug } from "../api/products";

export default function ProductPage(){
  const { pathname } = useRouter();
  const slug = pathname.split("/").pop()!;
  const [p, setP] = React.useState<any|null>(null);
  const { dispatch: cart } = useCart();
  const { push } = useViewed();
  const { state:w, dispatch:wish } = useWishlist();
  const { state:c, dispatch:cmp } = useCompare();

  React.useEffect(()=>{ getProductBySlug(slug).then(setP).catch(console.error); },[slug]);
  React.useEffect(()=>{ if(p) push(p.id); },[p]);

  if(!p) return <div className="container"><h1>Товар не найден</h1></div>;

  const wished = w.ids.includes(p.id);
  const compared = c.ids.includes(p.id);

  const crumbs = [{label:"Главная",href:"/"},{label:"Каталог",href:"/catalog"},
    {label:p.categoryPath[0],href:"/catalog/"+p.categoryPath[0]},
    {label:p.categoryPath[1],href:"/catalog/"+p.categoryPath.slice(0,2).join("/")},
    {label:p.title}];

  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <Breadcrumbs items={crumbs}/>
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:16}}>
        <div className="card" style={{padding:12, display:"grid",gap:8}}>
          <div className="thumb"><img alt={p.title} src={p.images[0]} /></div>
          <div style={{display:"flex",gap:8}}>
            {p.images.map((im:string,i:number)=>(<img key={i} src={im} alt="" style={{width:72,height:72,borderRadius:12,border:"1px solid var(--border)"}}/>))}
          </div>
        </div>
        <div className="card" style={{padding:16, display:"grid", gap:12}}>
          <h1>{p.title}</h1>
          <div style={{display:"flex",gap:6,alignItems:"center",color:"var(--muted)"}}>
            <Icon name="star"/><b>{p.rating.toFixed(1)}</b> • ID: {p.id}
          </div>
          <p>{p.short}</p>
          <div className="price" style={{fontSize:"1.25rem"}}><span className="now">{price(p.price)}</span>{p.oldPrice && <span className="old">{price(p.oldPrice)}</span>}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn primary" onClick={()=>cart({type:"add", product:p})}><Icon name="cart"/> Добавить в корзину</button>
            <button className={"btn"+(wished?" primary":"")} onClick={()=>wish({type:"toggle", id:p.id})}><Icon name="heart"/> {wished ? "В избранном" : "В избранное"}</button>
            <button className={"btn"+(compared?" primary":"")} onClick={()=>cmp({type:"toggle", id:p.id})}><Icon name="compare"/> {compared ? "В сравнении" : "Сравнить"}</button>
          </div>
          <div className="divider"></div>
          <div style={{display:"grid",gap:6}}>
            {Object.entries(p.attrs).map(([k,v]:any)=> (<div key={k}><span className="badge">{k}</span> {v}</div>))}
          </div>
        </div>
      </div>
    </div>
  );
}
