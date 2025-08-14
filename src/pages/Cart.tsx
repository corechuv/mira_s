import React from "react";
import { useCart } from "../store/store";
import { Link, useRouter } from "../router";
import { Icon } from "../icons/Icon";
import { price } from "../utils/money";

export default function CartPage(){
  const { state, dispatch, total } = useCart();
  const { push } = useRouter();

  return (
    <div className="container" style={{display:"grid",gap:16}}>
      <h1>Корзина</h1>
      {!state.lines.length && <div className="card" style={{padding:16}}>
        <p>Корзина пуста.</p>
        <div style={{marginTop:8}}><Link className="btn" to="/catalog">В каталог</Link></div>
      </div>}
      {!!state.lines.length && (
        <div className="grid" style={{gridTemplateColumns:"1fr 360px", gap:16}}>
          <div className="card" style={{padding:12}}>
            {state.lines.map(l=>(
              <div key={l.id} style={{display:"grid",gridTemplateColumns:"72px 1fr auto",gap:12,alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                <div className="thumb"><img src={l.image} alt=""/></div>
                <div>
                  <Link to={"/product/"+l.slug} style={{fontWeight:700}}>{l.title}</Link>
                  <div className="badge">{price(l.price)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <input type="number" className="input" style={{width:80}} min={1} value={l.qty} onChange={e=>dispatch({type:"setQty", id:l.id, qty:Number(e.target.value)})}/>
                  <button className="btn icon" onClick={()=>dispatch({type:"remove", id:l.id})}><Icon name="trash"/></button>
                </div>
              </div>
            ))}
          </div>
          <aside className="card" style={{padding:16,display:"grid",gap:8,height:"fit-content"}}>
            <h2>Итого</h2>
            <div><b>{price(total)}</b></div>
            <button className="btn primary" onClick={()=>push("/checkout")}>Перейти к оформлению</button>
            <button className="btn ghost" onClick={()=>dispatch({type:"clear"})}>Очистить корзину</button>
          </aside>
        </div>
      )}
    </div>
  );
}
